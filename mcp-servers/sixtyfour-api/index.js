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
const SIXTYFOUR_API_BASE = "https://api.sixtyfour.ai";
const API_KEY = process.env.SIXTYFOUR_API_KEY;

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "enrich_person",
        description: "Enrich person/lead data using SixtyFour API",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Person's full name"
            },
            title: {
              type: "string",
              description: "Job title"
            },
            company: {
              type: "string",
              description: "Company name"
            },
            location: {
              type: "string",
              description: "Location"
            },
            linkedin_url: {
              type: "string",
              description: "LinkedIn profile URL"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "research_person",
        description: "Research and find detailed information about a person",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Research query about the person"
            },
            name: {
              type: "string",
              description: "Person's name"
            },
            company: {
              type: "string",
              description: "Company they work at"
            }
          },
          required: ["query"]
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
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
  };

  try {
    switch (name) {
      case "enrich_person": {
        const requestBody = {
          name: args.name,
          ...(args.title && { title: args.title }),
          ...(args.company && { company: args.company }),
          ...(args.location && { location: args.location }),
          ...(args.linkedin_url && { linkedin_url: args.linkedin_url })
        };

        const response = await axios.post(`${SIXTYFOUR_API_BASE}/enrich-lead`, requestBody, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "research_person": {
        const requestBody = {
          query: args.query,
          ...(args.name && { name: args.name }),
          ...(args.company && { company: args.company })
        };

        const response = await axios.post(`${SIXTYFOUR_API_BASE}/research`, requestBody, { headers });

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