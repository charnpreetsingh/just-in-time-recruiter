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
            company_id: {
              type: "string",
              description: "Company ID (get from search_companies first)"
            }
          },
          required: ["company_id"]
        }
      },
      {
        name: "match_company",
        description: "Find company by name, URL, or LinkedIn profile",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Company name to match"
            },
            url: {
              type: "string", 
              description: "Company URL to match"
            },
            linkedin: {
              type: "string",
              description: "LinkedIn profile URL to match"
            }
          }
        }
      },
      {
        name: "search_companies",
        description: "Search companies directory with pagination and filtering",
        inputSchema: {
          type: "object",
          properties: {
            search: {
              type: "string",
              description: "Search term for company name"
            },
            offset: {
              type: "number",
              description: "Pagination offset (default: 0)"
            },
            page_size: {
              type: "number",
              description: "Results per page (max: 100, default: 10)"
            },
            sort_field: {
              type: "string",
              description: "Sort by: rank, employee_count, or id"
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
            job_tag_id: {
              type: "string",
              description: "Job tag ID for specific department/role"
            },
            since: {
              type: "string",
              description: "Filter results since this date (YYYY-MM-DD format)"
            }
          },
          required: ["company_id", "job_tag_id"]
        }
      },
      {
        name: "get_job_tags",
        description: "Get available job tags for filtering employee data",
        inputSchema: {
          type: "object",
          properties: {
            tag_ids: {
              type: "array",
              items: { type: "string" },
              description: "Optional array of specific tag IDs to retrieve"
            }
          }
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
        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.company_id}`, { headers });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "match_company": {
        const params = new URLSearchParams();
        if (args.name) params.append('name', args.name);
        if (args.url) params.append('url', args.url);
        if (args.linkedin) params.append('linkedin', args.linkedin);

        const response = await axios.get(`${MIXRANK_API_BASE}/companies/match?${params}`, { headers });

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
        if (args.search) params.append('search', args.search);
        if (args.offset) params.append('offset', args.offset.toString());
        if (args.page_size) params.append('page_size', args.page_size.toString());
        if (args.sort_field) params.append('sort_field', args.sort_field);

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
        if (args.since) params.append('since', args.since);

        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.company_id}/employee-metrics/${args.job_tag_id}/timeseries?${params}`, { headers });

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
        const params = new URLSearchParams();
        if (args.tag_ids && args.tag_ids.length > 0) {
          args.tag_ids.forEach(id => params.append('tag_ids', id));
        }

        const response = await axios.get(`${MIXRANK_API_BASE}/jobtags?${params}`, { headers });

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