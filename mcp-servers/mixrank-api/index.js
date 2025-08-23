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
    name: "mixrank-api-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Mixrank API base configuration
const MIXRANK_API_BASE = "https://api.mixrank.com/v2";
const API_KEY = process.env.MIXRANK_API_KEY;

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_company_profile",
        description: "Get company profile and insights from Mixrank",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Company domain (e.g., example.com)"
            }
          },
          required: ["domain"]
        }
      },
      {
        name: "search_companies",
        description: "Search for companies by criteria",
        inputSchema: {
          type: "object",
          properties: {
            industry: {
              type: "string",
              description: "Industry filter"
            },
            size: {
              type: "string",
              description: "Company size (startup, small, medium, large, enterprise)"
            },
            location: {
              type: "string",
              description: "Location filter"
            },
            funding_status: {
              type: "string",
              description: "Funding status filter"
            }
          }
        }
      },
      {
        name: "get_hiring_signals",
        description: "Get hiring signals and job postings for a company",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Company domain"
            },
            department: {
              type: "string",
              description: "Department/role filter (engineering, sales, marketing, etc.)"
            }
          },
          required: ["domain"]
        }
      },
      {
        name: "get_company_growth_signals",
        description: "Get growth indicators for a company",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Company domain"
            },
            timeframe: {
              type: "string",
              description: "Timeframe for growth analysis (30d, 90d, 180d, 1y)"
            }
          },
          required: ["domain"]
        }
      },
      {
        name: "get_technology_stack",
        description: "Get company's technology stack information",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Company domain"
            }
          },
          required: ["domain"]
        }
      }
    ]
  };
});

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!API_KEY) {
    throw new Error("MIXRANK_API_KEY not configured");
  }

  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  };

  try {
    switch (name) {
      case "get_company_profile": {
        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.domain}`, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "search_companies": {
        const params = new URLSearchParams();
        if (args.industry) params.append('industry', args.industry);
        if (args.size) params.append('size', args.size);
        if (args.location) params.append('location', args.location);
        if (args.funding_status) params.append('funding_status', args.funding_status);

        const response = await axios.get(`${MIXRANK_API_BASE}/companies/search?${params}`, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "get_hiring_signals": {
        const params = new URLSearchParams({ domain: args.domain });
        if (args.department) params.append('department', args.department);

        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.domain}/hiring?${params}`, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "get_company_growth_signals": {
        const params = new URLSearchParams({ domain: args.domain });
        if (args.timeframe) params.append('timeframe', args.timeframe);

        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.domain}/growth?${params}`, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "get_technology_stack": {
        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.domain}/technologies`, { headers });

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
      throw new Error(`Mixrank API error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mixrank MCP server running on stdio");
}

main().catch(console.error);