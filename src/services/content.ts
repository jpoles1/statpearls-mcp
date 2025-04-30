/**
 * Content service for the StatPearls MCP server
 */

import type { ArticleContent } from '../types/index.js';
import { extractArticleContent, filterSections } from '../utils/html.js';
import { ContentError, withErrorHandling, withSyncErrorHandling } from '../utils/error.js';

/**
 * Fetches the full content of a StatPearls article
 * @param url The URL of the article
 * @returns The HTML content of the article
 */
export const fetchArticleContent = withErrorHandling(
  async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ContentError(`Failed to fetch article: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  },
  'Error fetching article content'
);

/**
 * Processes an article from its URL
 * @param url The URL of the article to process
 * @returns Structured and filtered article content
 */
export const processArticle = withErrorHandling(
  async (url: string): Promise<ArticleContent> => {
    // Fetch the article HTML
    const html = await fetchArticleContent(url);
    
    // Extract the article content
    const content = extractArticleContent(html, url);
    console.log('Extracted content:', content);
    
    // Filter out unwanted sections
    const filteredContent = filterSections(content);
    
    // If no sections remain after filtering, throw an error
    if (filteredContent.sections.length === 0) {
      throw new ContentError('No content sections remained after filtering');
    }
    
    return filteredContent;
  },
  'Error processing article'
);

/**
 * Extracts the main content from a StatPearls article
 * @param html The HTML content of the article
 * @param url The URL of the article
 * @returns Structured article content
 */
export const extractContent = withSyncErrorHandling(
  (html: string, url: string): ArticleContent => {
    // Extract the article content
    const content = extractArticleContent(html, url);
    
    // Filter out unwanted sections
    return filterSections(content);
  },
  'Error extracting article content'
);