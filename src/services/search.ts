/**
 * Search service for the StatPearls MCP server
 */

import type { SearchResult } from '../types/index.js';
import { extractSearchResults } from '../utils/html.js';
import { SearchError, withErrorHandling } from '../utils/error.js';

/**
 * Base URL for StatPearls searches on NCBI
 */
const STATPEARLS_SEARCH_BASE_URL = 'https://www.ncbi.nlm.nih.gov/books/NBK430685/';

/**
 * Constructs the search URL for a given query
 * @param query The search query
 * @returns The search URL
 */
function constructSearchUrl(query: string): string {
  const url = new URL(STATPEARLS_SEARCH_BASE_URL);
  url.searchParams.set('term', query);
  return url.toString();
}

/**
 * Performs a search on StatPearls via NCBI
 * @param query The disease or medical condition to search for
 * @returns Array of search results with title, URL, and description
 */
export const searchStatPearls = withErrorHandling(
  async (query: string): Promise<SearchResult[]> => {
    const searchUrl = constructSearchUrl(query);
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new SearchError(`Failed to search StatPearls: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const results = extractSearchResults(html);
    
    if (results.length === 0) {
      console.warn(`No results found for query: ${query}`);
    }
    
    return results;
  },
  'Error searching StatPearls'
);

/**
 * Scores search results based on relevance to the query
 * @param results The search results to score
 * @param query The original search query
 * @returns Scored and sorted results
 */
export function scoreResults(results: SearchResult[], query: string): SearchResult[] {
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  // Score each result
  const scoredResults = results.map(result => {
    let score = 0;
    const title = result.title.toLowerCase();
    const description = result.description.toLowerCase();
    
    // Exact match in title is highly valuable
    if (title === query.toLowerCase()) {
      score += 100;
    }
    
    // Title contains the full query
    if (title.includes(query.toLowerCase())) {
      score += 50;
    }
    
    // Score based on query terms in title
    queryTerms.forEach(term => {
      if (title.includes(term)) {
        score += 10;
      }
    });
    
    // Score based on query terms in description
    queryTerms.forEach(term => {
      if (description.includes(term)) {
        score += 5;
      }
    });
    
    // Bonus for shorter titles (often more specific)
    score += Math.max(0, 30 - title.length) / 3;
    
    return {
      ...result,
      score
    };
  });
  
  // Sort by score (highest first)
  return scoredResults.sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Selects the most relevant result
 * @param results Scored search results
 * @returns The most relevant result, or null if no results
 */
export function selectBestResult(results: SearchResult[]): SearchResult | null {
  if (results.length === 0) {
    return null;
  }
  
  // Return the highest-scored result
  return results[0];
}