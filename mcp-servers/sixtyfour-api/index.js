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
        name: "enrich_lead",
        description: "Enrich lead information with contact details, social profiles, and company data",
        inputSchema: {
          type: "object",
          properties: {
            lead_info: {
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
                linkedin: {
                  type: "string",
                  description: "LinkedIn profile URL"
                }
              },
              required: ["name"]
            },
            struct: {
              type: "object",
              properties: {
                name: { type: "string", description: "The individual's full name" },
                email: { type: "string", description: "The individual's email address" },
                phone: { type: "string", description: "The individual's phone number" },
                company: { type: "string", description: "The company the individual is associated with" },
                title: { type: "string", description: "The individual's job title" },
                linkedin: { type: "string", description: "LinkedIn URL for the person" },
                website: { type: "string", description: "Company website URL" },
                location: { type: "string", description: "The individual's location and/or company location" },
                industry: { type: "string", description: "Industry the person operates in" },
                github_url: { type: "string", description: "URL for their github profile" },
                github_notes: { type: "string", description: "Take detailed notes on their github profile" }
              }
            }
          },
          required: ["lead_info"]
        }
      },
      {
        name: "enrich_company",
        description: "Enrich company data with additional information and find associated people",
        inputSchema: {
          type: "object",
          properties: {
            company_info: {
              type: "object",
              properties: {
                name: { type: "string", description: "Company name" },
                domain: { type: "string", description: "Company domain" },
                location: { type: "string", description: "Company location" }
              },
              required: ["name"]
            },
            struct: {
              type: "object",
              properties: {
                name: { type: "string", description: "Company name" },
                website: { type: "string", description: "Company website" },
                industry: { type: "string", description: "Company industry" },
                location: { type: "string", description: "Company location" },
                employees: { type: "string", description: "Number of employees" },
                technologies: { type: "string", description: "Technologies used by the company" },
                key_people: { type: "string", description: "Key people at the company" }
              }
            }
          },
          required: ["company_info"]
        }
      },
      {
        name: "find_email",
        description: "Find email addresses for leads",
        inputSchema: {
          type: "object",
          properties: {
            lead: {
              type: "object",
              properties: {
                name: { type: "string", description: "Person's full name" },
                company: { type: "string", description: "Company name" },
                title: { type: "string", description: "Job title" },
                location: { type: "string", description: "Location" }
              },
              required: ["name", "company"]
            }
          },
          required: ["lead"]
        }
      },
      {
        name: "find_phone",
        description: "Find phone numbers for leads", 
        inputSchema: {
          type: "object",
          properties: {
            lead: {
              type: "object",
              properties: {
                name: { type: "string", description: "Person's full name" },
                company: { type: "string", description: "Company name" },
                email: { type: "string", description: "Email address if known" },
                location: { type: "string", description: "Location" }
              },
              required: ["name", "company"]
            }
          },
          required: ["lead"]
        }
      },
      {
        name: "qa_agent",
        description: "Evaluate and qualify data against predefined criteria",
        inputSchema: {
          type: "object",
          properties: {
            data: {
              type: "object",
              description: "Data to be evaluated"
            },
            criteria: {
              type: "string",
              description: "Qualification criteria or questions to evaluate against"
            }
          },
          required: ["data", "criteria"]
        }
      }
    ]
  };
});

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  console.error(`[${requestId}] SixtyFour API Call: ${name}`);
  console.error(`[${requestId}] Arguments:`, JSON.stringify(args, null, 2));

  if (!API_KEY) {
    console.error(`[${requestId}] Error: SIXTYFOUR_API_KEY not configured`);
    throw new Error("SIXTYFOUR_API_KEY not configured");
  }

  const headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
  };

  const startTime = Date.now();
  try {
    switch (name) {
      case "enrich_lead": {
        const requestBody = {
          lead_info: args.lead_info,
          ...(args.struct && { struct: args.struct })
        };

        // Default struct if not provided
        if (!requestBody.struct) {
          requestBody.struct = {
            name: "The individual's full name",
            email: "The individual's email address",
            phone: "The individual's phone number",
            company: "The company the individual is associated with",
            title: "The individual's job title",
            linkedin: "LinkedIn URL for the person",
            website: "Company website URL",
            location: "The individual's location and/or company location",
            industry: "Industry the person operates in"
          };
        }

        const apiEndpoint = `${SIXTYFOUR_API_BASE}/enrich-lead`;
        console.error(`[${requestId}] API Request: POST ${apiEndpoint}`);
        console.error(`[${requestId}] Request Body:`, JSON.stringify(requestBody, null, 2));

        const response = await axios.post(apiEndpoint, requestBody, { headers });
        
        const duration = Date.now() - startTime;
        console.error(`[${requestId}] API Response: ${response.status} (${duration}ms)`);
        console.error(`[${requestId}] Response size: ${JSON.stringify(response.data).length} bytes`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "enrich_company": {
        const requestBody = {
          company_info: args.company_info,
          ...(args.struct && { struct: args.struct })
        };

        // Default struct if not provided
        if (!requestBody.struct) {
          requestBody.struct = {
            name: "Company name",
            website: "Company website",
            industry: "Company industry",
            location: "Company location",
            employees: "Number of employees",
            technologies: "Technologies used by the company",
            key_people: "Key people at the company"
          };
        }

        const apiEndpoint = `${SIXTYFOUR_API_BASE}/enrich-company`;
        console.error(`[${requestId}] API Request: POST ${apiEndpoint}`);
        console.error(`[${requestId}] Request Body:`, JSON.stringify(requestBody, null, 2));

        const response = await axios.post(apiEndpoint, requestBody, { headers });

        const duration = Date.now() - startTime;
        console.error(`[${requestId}] API Response: ${response.status} (${duration}ms)`);
        console.error(`[${requestId}] Company enriched: ${args.company_info.name}`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "find_email": {
        const requestBody = {
          lead: args.lead
        };

        const apiEndpoint = `${SIXTYFOUR_API_BASE}/find-email`;
        console.error(`[${requestId}] API Request: POST ${apiEndpoint}`);
        console.error(`[${requestId}] Request Body:`, JSON.stringify(requestBody, null, 2));

        const response = await axios.post(apiEndpoint, requestBody, { headers });

        const duration = Date.now() - startTime;
        console.error(`[${requestId}] API Response: ${response.status} (${duration}ms)`);
        console.error(`[${requestId}] Email search for: ${args.lead.name} at ${args.lead.company}`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "find_phone": {
        const requestBody = {
          lead: args.lead
        };

        const apiEndpoint = `${SIXTYFOUR_API_BASE}/find-phone`;
        console.error(`[${requestId}] API Request: POST ${apiEndpoint}`);
        console.error(`[${requestId}] Request Body:`, JSON.stringify(requestBody, null, 2));

        const response = await axios.post(apiEndpoint, requestBody, { headers });

        const duration = Date.now() - startTime;
        console.error(`[${requestId}] API Response: ${response.status} (${duration}ms)`);
        console.error(`[${requestId}] Phone search for: ${args.lead.name} at ${args.lead.company}`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case "qa_agent": {
        const requestBody = {
          data: args.data,
          criteria: args.criteria
        };

        const apiEndpoint = `${SIXTYFOUR_API_BASE}/qa-agent`;
        console.error(`[${requestId}] API Request: POST ${apiEndpoint}`);
        console.error(`[${requestId}] Request Body:`, JSON.stringify(requestBody, null, 2));

        const response = await axios.post(apiEndpoint, requestBody, { headers });

        const duration = Date.now() - startTime;
        console.error(`[${requestId}] API Response: ${response.status} (${duration}ms)`);
        console.error(`[${requestId}] QA evaluation completed`);

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
      throw new Error(`SixtyFour API error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SixtyFour MCP server running on stdio");
}

main().catch(console.error);