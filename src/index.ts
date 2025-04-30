#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { STATPEARLS_TOOL, handleStatPearlsRequest } from "./tools/statpearls.js";
import { logError } from "./utils/error.js";

// Get version from environment (set during build) or default to package.json version
const version = process.env.VERSION || "0.1.0";

// Server implementation
const server = new Server(
  {
    name: "statpearls-mcp",
    version,
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [STATPEARLS_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    switch (name) {
      case "statpearls_disease_info": {
        try {
          const result = await handleStatPearlsRequest(args);
          return {
            content: [{ type: "text", text: result }],
            isError: false,
          };
        } catch (error) {
          logError(error, 'StatPearls Tool Handler');
          return {
            content: [
              {
                type: "text",
                text: `Error fetching disease information: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    logError(error, 'MCP Server');
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("StatPearls MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
