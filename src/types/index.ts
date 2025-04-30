/**
 * Common type definitions for the StatPearls MCP server
 */

/**
 * Represents a search result from StatPearls
 */
export interface SearchResult {
  title: string;
  url: string;
  description: string;
  score?: number;
}

/**
 * Represents a section of an article
 */
export interface ArticleSection {
  heading: string;
  content: string;
  level: number;
}

/**
 * Represents the content of an article
 */
export interface ArticleContent {
  title: string;
  url: string;
  sections: ArticleSection[];
}

/**
 * Format options for the output
 */
export interface FormatOptions {
  includeToc?: boolean;
  maxLength?: number;
}

/**
 * Arguments for the StatPearls tool
 */
export interface StatPearlsArgs {
  query: string;
  format_options?: FormatOptions;
}