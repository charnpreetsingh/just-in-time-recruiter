#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const server = new Server(
  {
    name: "sixtyfour-api-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// SixtyFour API base configuration
const SIXTYFOUR_API_BASE = "https://api.sixtyfour.io/v1";
const API_KEY = process.env.SIXTYFOUR_API_KEY;

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_candidates",
        description: "Search for candidates using SixtyFour API",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for candidates"
            },
            skills: {
              type: "array",
              items: { type: "string" },
              description: "Required skills"
            },
            location: {
              type: "string",
              description: "Location filter"
            },
            experience_level: {
              type: "string",
              description: "Experience level (junior, mid, senior)"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_candidate_profile",
        description: "Get detailed candidate profile",
        inputSchema: {
          type: "object",
          properties: {
            candidate_id: {
              type: "string",
              description: "Candidate ID"
            }
          },
          required: ["candidate_id"]
        }
      },
      {
        name: "get_talent_insights",
        description: "Get talent market insights",
        inputSchema: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Job role to analyze"
            },
            location: {
              type: "string",
              description: "Location for insights"
            }
          },
          required: ["role"]
        }
      }
    ]
  };
});

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!API_KEY) {
    throw new Error("SIXTYFOUR_API_KEY not configured");
  }

  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  };

  try {
    switch (name) {
      case "search_candidates": {
        const response = await axios.post(`${SIXTYFOUR_API_BASE}/candidates/search`, {
          query: args.query,
          filters: {
            skills: args.skills,
            location: args.location,
            experience_level: args.experience_level
          }
        }, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "get_candidate_profile": {
        const response = await axios.get(`${SIXTYFOUR_API_BASE}/candidates/${args.candidate_id}`, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "get_talent_insights": {
        const response = await axios.get(`${SIXTYFOUR_API_BASE}/insights/talent`, {
          headers,
          params: {
            role: args.role,
            location: args.location
          }
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error.response) {
      throw new Error(`SixtyFour API error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SixtyFour MCP server running on stdio");
}

main().catch(console.error);