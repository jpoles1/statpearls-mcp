/**
 * StatPearls tool definition and handler
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { StatPearlsArgs } from '../types/index.js';
import { searchStatPearls, scoreResults, selectBestResult } from '../services/search.js';
import { processArticle } from '../services/content.js';
import { formatMarkdown } from '../services/markdown.js';
import { logError } from '../utils/error.js';

/**
 * StatPearls tool definition
 */
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
          includeToc: {
            type: "boolean",
            description: "Whether to include a table of contents",
            default: true
          },
          maxLength: {
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

/**
 * Type guard for StatPearls tool arguments
 */
function isStatPearlsArgs(args: unknown): args is StatPearlsArgs {
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
export async function handleStatPearlsRequest(args: unknown): Promise<string> {
  if (!isStatPearlsArgs(args)) {
    throw new Error("Invalid arguments for statpearls_disease_info");
  }
  
  const { query, format_options = {} } = args;
  
  try {
    // Search for the disease
    console.log(`Searching StatPearls for: ${query}`);
    const searchResults = await searchStatPearls(query);
    
    if (searchResults.length === 0) {
      return `No information found for "${query}". Please try a different search term.`;
    }
    
    // Score and select the best result
    const scoredResults = scoreResults(searchResults, query);
    const bestResult = selectBestResult(scoredResults);
    
    if (!bestResult) {
      return `No relevant information found for "${query}". Please try a different search term.`;
    }
    
    console.log(`Selected result: ${bestResult.title} (${bestResult.url})`);
    
    // Process the article
    const articleContent = await processArticle(bestResult.url);
    
    // Format the content as markdown
    const markdown = formatMarkdown(articleContent, {
      includeToc: format_options.includeToc !== false,
      maxLength: format_options.maxLength
    });
    
    return markdown;
  } catch (error) {
    logError(error, 'StatPearls Tool');
    throw new Error(`Error fetching information: ${error instanceof Error ? error.message : String(error)}`);
  }
}