/**
 * Markdown conversion service for the StatPearls MCP server
 */

import TurndownService from 'turndown';
import type { ArticleContent, FormatOptions } from '../types/index.js';

/**
 * Configures the Turndown service with custom rules for medical content
 * @returns Configured Turndown service
 */
function configureTurndown(): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
  });
  
  // Add custom rules for medical content
  
  // Preserve tables
  turndownService.addRule('tables', {
    filter: ['table'],
    replacement: function(content, node) {
      // For complex tables, we might want to keep the HTML
      // This is a simple implementation that might need enhancement
      const tableHtml = (node as HTMLElement).outerHTML;
      return '\n\n' + tableHtml + '\n\n';
    }
  });
  
  // Preserve definition lists which are common in medical content
  turndownService.addRule('definitionList', {
    filter: ['dl'],
    replacement: function(content) {
      return '\n\n' + content + '\n\n';
    }
  });
  
  // Preserve definition terms
  turndownService.addRule('definitionTerm', {
    filter: ['dt'],
    replacement: function(content) {
      return '**' + content + '**\n\n';
    }
  });
  
  // Preserve definition descriptions
  turndownService.addRule('definitionDescription', {
    filter: ['dd'],
    replacement: function(content) {
      return content + '\n\n';
    }
  });
  
  return turndownService;
}

/**
 * Converts HTML content to Markdown
 * @param html The HTML content to convert
 * @returns Markdown content
 */
export function convertToMarkdown(html: string): string {
  const turndownService = configureTurndown();
  return turndownService.turndown(html);
}

/**
 * Generates a table of contents from article sections
 * @param content The article content
 * @returns Markdown table of contents
 */
function generateTableOfContents(content: ArticleContent): string {
  let toc = '## Table of Contents\n\n';
  
  content.sections.forEach(section => {
    // Create indentation based on heading level
    const indent = '  '.repeat(section.level - 1);
    
    // Create a link-friendly version of the heading
    const linkId = section.heading
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    toc += `${indent}- [${section.heading}](#${linkId})\n`;
  });
  
  return toc + '\n';
}

/**
 * Formats the article content as a structured Markdown document
 * @param content The filtered article content
 * @param options Formatting options
 * @returns Formatted Markdown content
 */
export function formatMarkdown(content: ArticleContent, options: FormatOptions = {}): string {
  const { includeToc = true, maxLength } = options;
  
  // Start with the title
  let markdown = `# ${content.title}\n\n`;
  
  // Add source information
  markdown += `*Source: [StatPearls - ${content.title}](${content.url})*\n\n`;
  
  // Add table of contents if requested
  if (includeToc) {
    markdown += generateTableOfContents(content);
  }
  
  // Add each section
  content.sections.forEach(section => {
    // Create the appropriate heading level
    const headingMarkers = '#'.repeat(section.level);
    
    // Add the section heading
    markdown += `${headingMarkers} ${section.heading}\n\n`;
    
    // Convert the section content from HTML to Markdown
    const sectionContent = convertToMarkdown(section.content);
    
    // Add the section content
    markdown += `${sectionContent}\n\n`;
  });
  
  // Add a disclaimer
  markdown += '---\n\n';
  markdown += '*This information is provided by StatPearls, a trusted source of peer-reviewed medical content.*\n';
  
  // Apply length limit if specified
  if (maxLength && markdown.length > maxLength) {
    markdown = markdown.substring(0, maxLength) + '\n\n*[Content truncated due to length limitations]*';
  }
  
  return markdown;
}