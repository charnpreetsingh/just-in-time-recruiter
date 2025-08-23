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

if (!API_KEY) {
  console.error("MIXRANK_API_KEY environment variable is not set");
  process.exit(1);
}

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
        name: "get_companies_paginated",
        description: "Get companies with advanced pagination controls and metadata",
        inputSchema: {
          type: "object",
          properties: {
            page: {
              type: "number",
              description: "Page number (1-based, default: 1)"
            },
            per_page: {
              type: "number",
              description: "Results per page (max: 100, default: 25)"
            },
            search: {
              type: "string",
              description: "Search term for company name"
            },
            sort_field: {
              type: "string",
              description: "Sort by: rank, employee_count, or id"
            },
            sort_order: {
              type: "string",
              description: "Sort order: asc or desc",
              enum: ["asc", "desc"]
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
            },
            limit: {
              type: "number",
              description: "Maximum number of time points to return (default: 50, max: 200)"
            },
            offset: {
              type: "number",
              description: "Number of time points to skip (default: 0)"
            }
          },
          required: ["company_id", "job_tag_id"]
        }
      },
      {
        name: "batch_get_employee_metrics",
        description: "Get employee metrics for multiple companies efficiently",
        inputSchema: {
          type: "object",
          properties: {
            company_ids: {
              type: "array",
              items: { type: "string" },
              description: "Array of company IDs to get metrics for"
            },
            job_tag_id: {
              type: "string",
              description: "Optional job tag ID to filter by department/role"
            },
            batch_size: {
              type: "number",
              description: "Process in batches of this size (default: 5, max: 10)"
            }
          },
          required: ["company_ids"]
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
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);

  console.error(`[${requestId}] Mixrank API Call: ${name}`);
  console.error(`[${requestId}] Arguments:`, JSON.stringify(args, null, 2));

  if (!API_KEY) {
    console.error(`[${requestId}] Error: MIXRANK_API_KEY not configured`);
    throw new Error("MIXRANK_API_KEY not configured");
  }

  const headers = {
    "Content-Type": "application/json"
  };

  const startTime = Date.now();
  try {
    switch (name) {
      case "get_company_profile": {
        const apiEndpoint = `${MIXRANK_API_BASE}/companies/${args.company_id}`;
        console.error(`[${requestId}] API Request: GET ${apiEndpoint}`);

        const response = await axios.get(apiEndpoint, { headers });

        const duration = Date.now() - startTime;
        console.error(`[${requestId}] API Response: ${response.status} (${duration}ms)`);
        console.error(`[${requestId}] Company: ${response.data.name || 'Unknown'}`);

        // Extract only essential company profile fields
        const essentialData = {
          id: response.data.id,
          name: response.data.name,
          domain: response.data.domain,
          employee_count: response.data.employee_count,
          founded_year: response.data.founded_year,
          location: response.data.location,
          industry: response.data.industry,
          funding_total: response.data.funding_total,
          last_funding_date: response.data.last_funding_date,
          revenue_range: response.data.revenue_range,
          growth_stage: response.data.growth_stage,
          description: response.data.description ? response.data.description.substring(0, 200) + '...' : null
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(essentialData, null, 2)
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

        // Extract only essential matching data
        const essentialMatches = {
          matches: response.data.results ? response.data.results.slice(0, 5).map(match => ({
            id: match.id,
            name: match.name,
            domain: match.domain,
            employee_count: match.employee_count,
            confidence_score: match.confidence_score
          })) : [],
          total_matches: response.data.total_matches
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(essentialMatches, null, 2)
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

        const apiEndpoint = `${MIXRANK_API_BASE}/companies?${params}`;
        console.error(`[${requestId}] API Request: GET ${apiEndpoint}`);

        const response = await axios.get(apiEndpoint, { headers });

        const duration = Date.now() - startTime;
        console.error(`[${requestId}] API Response: ${response.status} (${duration}ms)`);
        console.error(`[${requestId}] Companies found: ${response.data.results?.length || 0}`);

        // Extract only essential company search results
        const essentialResults = {
          results: response.data.results ? response.data.results.map(company => ({
            id: company.id,
            name: company.name,
            domain: company.domain,
            employee_count: company.employee_count,
            location: company.location,
            industry: company.industry,
            growth_stage: company.growth_stage,
            last_funding_date: company.last_funding_date
          })) : [],
          pagination: {
            offset: args.offset || 0,
            page_size: args.page_size || 10,
            current_page: Math.floor((args.offset || 0) / (args.page_size || 10)) + 1,
            has_more: response.data.results && response.data.results.length === (args.page_size || 10),
            next_offset: (args.offset || 0) + (args.page_size || 10),
            prev_offset: Math.max(0, (args.offset || 0) - (args.page_size || 10))
          },
          total_count: response.data.total_count
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(essentialResults, null, 2)
            }
          ]
        };
      }

      case "get_companies_paginated": {
        const page = args.page || 1;
        const perPage = Math.min(args.per_page || 25, 100);
        const offset = (page - 1) * perPage;

        const params = new URLSearchParams();
        params.append('offset', offset.toString());
        params.append('page_size', perPage.toString());
        if (args.search) params.append('search', args.search);
        if (args.sort_field) params.append('sort_field', args.sort_field);

        const response = await axios.get(`${MIXRANK_API_BASE}/companies?${params}`, { headers });

        // Extract essential data with enhanced pagination
        const totalResults = response.data.total_count || 0;
        const totalPages = Math.ceil(totalResults / perPage);

        const essentialPaginatedResults = {
          results: response.data.results ? response.data.results.map(company => ({
            id: company.id,
            name: company.name,
            domain: company.domain,
            employee_count: company.employee_count,
            location: company.location,
            industry: company.industry,
            growth_stage: company.growth_stage
          })) : [],
          pagination: {
            current_page: page,
            per_page: perPage,
            total_pages: totalPages,
            total_results: totalResults,
            has_previous: page > 1,
            has_next: page < totalPages,
            previous_page: page > 1 ? page - 1 : null,
            next_page: page < totalPages ? page + 1 : null,
            offset: offset
          }
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(essentialPaginatedResults, null, 2)
            }
          ]
        };
      }

      case "get_employee_metrics": {
        const params = new URLSearchParams();
        if (args.tag_id) params.append('tag_id', args.tag_id);

        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.company_id}/employee-metrics?${params}`, { headers });

        // Extract only essential employee metrics (hiring signals)
        const essentialMetrics = {
          company_id: args.company_id,
          current_employee_count: response.data.current_employee_count,
          employee_growth_6m: response.data.employee_growth_6m,
          employee_growth_12m: response.data.employee_growth_12m,
          growth_rate_percentage: response.data.growth_rate_percentage,
          hiring_velocity: response.data.hiring_velocity,
          departments_hiring: response.data.departments_hiring ? response.data.departments_hiring.slice(0, 5) : [],
          recent_hires_count: response.data.recent_hires_count,
          last_updated: response.data.last_updated
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(essentialMetrics, null, 2)
            }
          ]
        };
      }

      case "get_employee_growth_timeseries": {
        const params = new URLSearchParams();
        if (args.since) params.append('since', args.since);

        const limit = Math.min(args.limit || 50, 200);
        const offset = args.offset || 0;

        params.append('limit', limit.toString());
        params.append('offset', offset.toString());

        const response = await axios.get(`${MIXRANK_API_BASE}/companies/${args.company_id}/employee-metrics/${args.job_tag_id}/timeseries?${params}`, { headers });

        // Extract essential timeseries data (recent trends only)
        const essentialTimeseries = {
          company_id: args.company_id,
          job_tag_id: args.job_tag_id,
          timeseries: response.data.timeseries ? response.data.timeseries.map(point => ({
            date: point.date,
            employee_count: point.employee_count,
            net_change: point.net_change,
            growth_rate: point.growth_rate
          })).slice(-12) : [], // Only last 12 data points
          trend_summary: {
            total_growth: response.data.total_growth,
            avg_monthly_growth: response.data.avg_monthly_growth,
            trend_direction: response.data.trend_direction
          },
          pagination: {
            limit: limit,
            offset: offset,
            has_more: response.data.timeseries && response.data.timeseries.length === limit,
            next_offset: offset + limit,
            prev_offset: Math.max(0, offset - limit)
          }
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(essentialTimeseries, null, 2)
            }
          ]
        };
      }

      case "batch_get_employee_metrics": {
        const batchSize = Math.min(args.batch_size || 5, 10);
        const companyIds = args.company_ids;
        const results = [];

        console.error(`[${requestId}] Batch processing ${companyIds.length} companies in batches of ${batchSize}`);

        // Process companies in batches
        for (let i = 0; i < companyIds.length; i += batchSize) {
          const batch = companyIds.slice(i, i + batchSize);

          try {
            const batchPromises = batch.map(companyId => {
              const params = new URLSearchParams();
              if (args.job_tag_id) params.append('tag_id', args.job_tag_id);

              return axios.get(`${MIXRANK_API_BASE}/companies/${companyId}/employee-metrics?${params}`, { headers })
                .then(response => ({
                  success: true,
                  company_id: companyId,
                  data: response.data
                }))
                .catch(error => ({
                  success: false,
                  company_id: companyId,
                  error: error.message
                }));
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Add delay between batches to respect rate limits
            if (i + batchSize < companyIds.length) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } catch (error) {
            results.push({
              success: false,
              error: error.message,
              batch: i / batchSize + 1
            });
          }
        }

        const response = {
          total_requested: companyIds.length,
          total_processed: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results: results
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
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
        console.error(`[${requestId}] Error: Unknown tool: ${name}`);
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Request failed after ${duration}ms: ${error.message}`);

    if (error.response) {
      console.error(`[${requestId}] API Error Details: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      throw new Error(`Mixrank API error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
});

async function main() {
  try {
    console.error(`Mixrank MCP server starting with API key: ${API_KEY ? 'SET' : 'NOT SET'}`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Mixrank MCP server running on stdio");
  } catch (error) {
    console.error("Failed to start Mixrank MCP server:", error);
    process.exit(1);
  }
}

main().catch(console.error);