# StatPearls Tool Implementation Reference

This document provides a detailed reference for implementing the StatPearls tool, which will fetch disease information from StatPearls via NCBI.

## Tool Definition

```typescript
// src/tools/statpearls.ts

import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const STATPEARLS_TOOL: Tool = {
  name: "statpearls_disease_info",
  description:
    "Fetches comprehensive, reliable medical information about diseases from StatPearls, " +
    "a trusted source of peer-reviewed medical content. " +
    "Use this tool to get detailed information about diseases, conditions, symptoms, " +
    "treatments, and medical concepts. " +
    "Returns structured information including etiology, epidemiology, pathophysiology, " +
    "clinical features, diagnosis, treatment, and prognosis when available.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Disease or medical condition to search for (e.g., 'diabetes', 'hypertension', 'alzheimer')"
      },
      format_options: {
        type: "object",
        description: "Optional formatting preferences",
        properties: {
          include_toc: {
            type: "boolean",
            description: "Whether to include a table of contents",
            default: true
          },
          max_length: {
            type: "number",
            description: "Maximum length of the returned content in characters",
            default: 50000
          }
        }
      }
    },
    required: ["query"]
  }
};
```

## Search Implementation

```typescript
// src/services/search.ts

/**
 * Performs a search on StatPearls via NCBI
 * @param query The disease or medical condition to search for
 * @returns Array of search results with title, URL, and description
 */
export async function searchStatPearls(query: string) {
  const searchUrl = new URL("https://www.ncbi.nlm.nih.gov/books/NBK430685/");
  searchUrl.searchParams.set("term", query);
  
  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    throw new Error(`Failed to search StatPearls: ${response.status} ${response.statusText}`);
  }
  
  const html = await response.text();
  
  // Parse the HTML to extract search results
  // This is a simplified example - actual implementation will need more robust parsing
  const results = parseSearchResults(html);
  
  return results;
}

/**
 * Parses the HTML of the search results page to extract results
 * @param html The HTML content of the search results page
 * @returns Array of search results
 */
function parseSearchResults(html: string) {
  // Implementation will use a DOM parser to extract:
  // - Result titles
  // - Result URLs
  // - Brief descriptions
  
  // For now, return a placeholder
  return [];
}

/**
 * Scores search results based on relevance to the query
 * @param results The search results to score
 * @param query The original search query
 * @returns Scored and sorted results
 */
export function scoreResults(results: any[], query: string) {
  // Implementation will score results based on:
  // - Exact matches in title
  // - Keyword frequency
  // - Result position
  
  // Sort results by score
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Selects the most relevant result
 * @param results Scored search results
 * @returns The most relevant result, or null if no results
 */
export function selectBestResult(results: any[]) {
  if (results.length === 0) {
    return null;
  }
  
  // Return the highest-scored result
  return results[0];
}
```

## Content Retrieval Implementation

```typescript
// src/services/content.ts

/**
 * Fetches the full content of a StatPearls article
 * @param url The URL of the article
 * @returns The HTML content of the article
 */
export async function fetchArticleContent(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}

/**
 * Parses the HTML content of a StatPearls article
 * @param html The HTML content of the article
 * @returns Structured article content with sections
 */
export function parseArticleContent(html: string) {
  // Implementation will:
  // 1. Use a DOM parser to navigate the document
  // 2. Extract the article title
  // 3. Identify section headings
  // 4. Extract content within each section
  // 5. Handle special elements like tables and lists
  
  // For now, return a placeholder
  return {
    title: "",
    sections: []
  };
}

/**
 * Filters out unwanted sections from the article content
 * @param content The parsed article content
 * @returns Filtered article content
 */
export function filterSections(content: any) {
  // Implementation will remove sections like:
  // - References
  // - Author Information
  // - Copyright Information
  
  // For now, return the input
  return content;
}
```

## Markdown Conversion Implementation

```typescript
// src/services/markdown.ts

import TurndownService from "turndown";

/**
 * Configures the Turndown service with custom rules for medical content
 * @returns Configured Turndown service
 */
function configureTurndown() {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*"
  });
  
  // Add custom rules for medical content
  // - Table handling
  // - List preservation
  // - Medical terminology preservation
  
  return turndownService;
}

/**
 * Converts HTML content to Markdown
 * @param html The HTML content to convert
 * @returns Markdown content
 */
export function convertToMarkdown(html: string) {
  const turndownService = configureTurndown();
  return turndownService.turndown(html);
}

/**
 * Formats the article content as a structured Markdown document
 * @param content The filtered article content
 * @param options Formatting options
 * @returns Formatted Markdown content
 */
export function formatMarkdown(content: any, options: any = {}) {
  // Implementation will:
  // 1. Create a title
  // 2. Optionally add a table of contents
  // 3. Format each section with appropriate headings
  // 4. Apply length limits if specified
  
  // For now, return a placeholder
  return "";
}
```

## Tool Handler Implementation

```typescript
// src/tools/statpearls.ts (continued)

import { searchStatPearls, scoreResults, selectBestResult } from "../services/search.js";
import { fetchArticleContent, parseArticleContent, filterSections } from "../services/content.js";
import { convertToMarkdown, formatMarkdown } from "../services/markdown.js";

/**
 * Type guard for StatPearls tool arguments
 */
function isStatPearlsArgs(args: unknown): args is { 
  query: string; 
  format_options?: { 
    include_toc?: boolean; 
    max_length?: number; 
  } 
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string"
  );
}

/**
 * Handles the StatPearls tool request
 * @param args Tool arguments
 * @returns Formatted disease information
 */
export async function handleStatPearlsRequest(args: unknown) {
  if (!isStatPearlsArgs(args)) {
    throw new Error("Invalid arguments for statpearls_disease_info");
  }
  
  const { query, format_options = {} } = args;
  
  try {
    // Search for the disease
    const searchResults = await searchStatPearls(query);
    
    // Score and select the best result
    const scoredResults = scoreResults(searchResults, query);
    const bestResult = selectBestResult(scoredResults);
    
    if (!bestResult) {
      return `No information found for "${query}". Please try a different search term.`;
    }
    
    // Fetch the full article content
    const articleHtml = await fetchArticleContent(bestResult.url);
    
    // Parse and filter the content
    const parsedContent = parseArticleContent(articleHtml);
    const filteredContent = filterSections(parsedContent);
    
    // Convert to markdown and format
    const markdown = formatMarkdown(filteredContent, format_options);
    
    return markdown;
  } catch (error) {
    throw new Error(`Error fetching information: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Integration with MCP Server

```typescript
// src/index.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { STATPEARLS_TOOL, handleStatPearlsRequest } from "./tools/statpearls.js";

// Server implementation
const server = new Server(
  {
    name: "statpearls-mcp",
    version: "0.1.0",
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
        const result = await handleStatPearlsRequest(args);
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
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
```

## HTML Parsing Utilities

```typescript
// src/utils/html.ts

/**
 * Utility functions for HTML parsing
 * 
 * These functions will help with extracting content from the StatPearls HTML pages.
 * The actual implementation will likely use a DOM parser like jsdom or cheerio.
 */

/**
 * Extracts search results from the search page HTML
 * @param html The HTML content of the search page
 * @returns Array of search results
 */
export function extractSearchResults(html: string) {
  // Implementation will extract search results from the HTML
  // This is a placeholder
  return [];
}

/**
 * Extracts the article content from the article page HTML
 * @param html The HTML content of the article page
 * @returns Structured article content
 */
export function extractArticleContent(html: string) {
  // Implementation will extract article content from the HTML
  // This is a placeholder
  return {
    title: "",
    sections: []
  };
}

/**
 * Extracts tables from HTML content
 * @param html The HTML content containing tables
 * @returns Array of extracted tables
 */
export function extractTables(html: string) {
  // Implementation will extract tables from the HTML
  // This is a placeholder
  return [];
}
```

## Error Handling Utilities

```typescript
// src/utils/error.ts

/**
 * Custom error class for search-related errors
 */
export class SearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchError";
  }
}

/**
 * Custom error class for content retrieval errors
 */
export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

/**
 * Custom error class for parsing errors
 */
export class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParsingError";
  }
}

/**
 * Wraps a function with error handling
 * @param fn The function to wrap
 * @param errorMessage The error message to use if the function throws
 * @returns The wrapped function
 */
export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorMessage: string
): (...args: Args) => Promise<T> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
}
```

## Implementation Notes

1. **HTML Parsing**: The implementation will need to handle the specific structure of StatPearls pages on NCBI. This may require examining the actual HTML structure and adapting the parsing logic accordingly.

2. **Error Handling**: Robust error handling is essential, especially for network requests and HTML parsing, which can fail in various ways.

3. **Rate Limiting**: Consider implementing rate limiting to avoid overloading the NCBI servers.

4. **Caching**: For improved performance, consider implementing a caching mechanism for frequently requested diseases.

5. **Testing**: Create comprehensive tests for each component, especially the HTML parsing logic, which can be brittle.