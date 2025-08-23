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
const API_KEY = process.env.MIXRANK_API_KEY;
const MIXRANK_API_BASE = `https://api.mixrank.com/v2/json/${API_KEY}`;

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
        name: "get_employee_metrics",
        description: "Get employee headcount metrics and hiring signals for a company",
        inputSchema: {
          type: "object",
          properties: {
            company_id: {
              type: "string",
              description: "Company ID (get from search_companies first)"
            },
            tag_id: {
              type: "string",
              description: "Job tag ID for filtering by department/role (optional)"
            }
          },
          required: ["company_id"]
        }
      },
      {
        name: "get_employee_growth_timeseries",
        description: "Get employee growth trends over time for hiring signals",
        inputSchema: {
          type: "object",
          properties: {
            company_id: {
              type: "string",
              description: "Company ID"
            },
            tag_id: {
              type: "string",
              description: "Job tag ID for specific department/role"
            },
            start_date: {
              type: "string",
              description: "Start date (YYYY-MM format)"
            },
            end_date: {
              type: "string",
              description: "End date (YYYY-MM format)"
            }
          },
          required: ["company_id", "tag_id"]
        }
      },
      {
        name: "get_job_tags",
        description: "Get available job tags for filtering employee data",
        inputSchema: {
          type: "object",
          properties: {}
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

        const response = await axios.get(`${MIXRANK_API_BASE}/companies?${params}`, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "get_employee_metrics": {
        const params = new URLSearchParams();
        if (args.tag_id) params.append('tag_id', args.tag_id);

        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.company_id}/employee-metrics?${params}`, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "get_employee_growth_timeseries": {
        const params = new URLSearchParams();
        if (args.start_date) params.append('start_date', args.start_date);
        if (args.end_date) params.append('end_date', args.end_date);

        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.company_id}/employee-metrics/${args.tag_id}/timeseries?${params}`, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "get_job_tags": {
        const response = await axios.get(`${MIXRANK_API_BASE}/jobtags`, { headers });

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