/**
 * HTML parsing utilities for the StatPearls MCP server
 */

import * as cheerio from 'cheerio';
import type { SearchResult, ArticleSection, ArticleContent } from '../types/index.js';
import { ParsingError } from './error.js';
import { parseStatPearlsArticle, parseStatPearlsSearchResults } from './statpearls-parser.js';
import type { StatPearlsSearchResult } from '../types/statpearls.js';

/**
 * Extracts search results from the NCBI StatPearls search page
 * @param html The HTML content of the search page
 * @returns Array of search results
 */
/**
 * Extracts search results from the NCBI StatPearls search page
 * Uses the more comprehensive parser for better results
 * @param html The HTML content of the search page
 * @returns Array of search results
 */
export function extractSearchResults(html: string): SearchResult[] {
  try {
    // Use the comprehensive parser to extract detailed search results
    const parsedResults = parseStatPearlsSearchResults(html);
    
    // Convert the detailed StatPearlsSearchResult to the simpler SearchResult format
    return parsedResults.map((result: StatPearlsSearchResult) => ({
      title: result.title,
      url: result.url,
      description: result.description ||
                  (result.authors && result.authors.length > 0 ?
                   `By ${result.authors.join(', ')}` :
                   'No description available')
    }));
  } catch (error) {
    // If the comprehensive parser fails, fall back to the simpler implementation
    try {
      const $ = cheerio.load(html);
      const results: SearchResult[] = [];

      // NCBI search results are typically in elements with class 'rslt'
      $('.rslt').each((i, element) => {
        // Extract title from the first link in the result
        const titleElement = $(element).find('a').first();
        const title = titleElement.text().trim();
        
        // Extract URL from the link
        const relativeUrl = titleElement.attr('href');
        const url = relativeUrl ?
          new URL(relativeUrl, 'https://www.ncbi.nlm.nih.gov').toString() :
          '';
        
        // Extract description from the result text
        const descriptionElement = $(element).find('p').first();
        const description = descriptionElement.text().trim();

        if (title && url) {
          results.push({
            title,
            url,
            description: description || 'No description available'
          });
        }
      });

      return results;
    } catch (fallbackError) {
      throw new ParsingError(`Failed to extract search results: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Extracts the content of a StatPearls article
 * @param html The HTML content of the article
 * @param url The URL of the article
 * @returns Structured article content
 */
/**
 * Extracts the content of a StatPearls article using the comprehensive parser
 * @param html The HTML content of the article
 * @param url The URL of the article
 * @returns Structured article content conforming to ArticleContent interface
 */
export function extractArticleContent(html: string, url: string): ArticleContent {
  try {
    // First try to use the comprehensive parser
    try {
      // Use the comprehensive parser to extract detailed article data
      const parsedArticle = parseStatPearlsArticle(html, url);
      
      // Convert the detailed StatPearlsArticle to the simpler ArticleContent format
      const sections: ArticleSection[] = [];
      const sectionMap: Record<string, ArticleSection> = {};
      
      // First, collect all sections from the HTML to maintain proper order
      const $ = cheerio.load(html);
      const orderedSections: {heading: string, content: string}[] = [];
      
      // Find all section divs within the jig-ncbiinpagenav container
      $('.jig-ncbiinpagenav div[id^="article-"]').each((i, el) => {
        const heading = $(el).find('> h2').first().text().trim();
        
        // Skip empty headings
        if (!heading || !heading.trim()) {
          return;
        }
        
        // Extract the content HTML
        let sectionContent = '';
        $(el).children().each((j, child) => {
          if (j > 0) { // Skip the heading
            sectionContent += $.html(child);
          }
        });
        
        // Add to ordered sections if not a duplicate
        if (!orderedSections.some(s => s.heading === heading)) {
          orderedSections.push({
            heading,
            content: sectionContent
          });
        }
      });
      
      // Add abstract if available
      if (parsedArticle.abstract) {
        sectionMap['Abstract'] = {
          heading: 'Abstract',
          content: parsedArticle.abstract,
          level: 2
        };
      }
      
      // Add introduction if available
      if (parsedArticle.introduction) {
        sectionMap['Introduction'] = {
          heading: 'Introduction',
          content: parsedArticle.introduction,
          level: 2
        };
      }
      
      // Add objectives if available
      if (parsedArticle.objectives && parsedArticle.objectives.items.length > 0) {
        const objectivesContent = `<ul>${parsedArticle.objectives.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        sectionMap['Objectives'] = {
          heading: 'Objectives',
          content: objectivesContent,
          level: 2
        };
      }
      
      // Add references section if available
      if (parsedArticle.references && parsedArticle.references.length > 0) {
        const referencesContent = parsedArticle.references.map(ref =>
          `<p id="ref-${ref.id}">${ref.number}. ${ref.text}</p>`
        ).join('');
        
        sectionMap['References'] = {
          heading: 'References',
          content: referencesContent,
          level: 2
        };
      }
      
      // Now build the final sections array in the correct order
      // First, add special sections in a specific order if they exist
      const specialSections = ['Abstract', 'Introduction', 'Objectives'];
      for (const heading of specialSections) {
        if (sectionMap[heading]) {
          sections.push(sectionMap[heading]);
          // Mark as used
          delete sectionMap[heading];
        }
      }
      
      // Then add all other sections in the order they appear in the HTML
      for (const section of orderedSections) {
        // Skip sections we've already added
        if (specialSections.includes(section.heading) || section.heading === 'References') {
          continue;
        }
        
        sections.push({
          heading: section.heading,
          content: section.content,
          level: 2
        });
      }
      
      // Finally, add References at the end if it exists
      if (sectionMap['References']) {
        sections.push(sectionMap['References']);
      }
    
      return {
        title: parsedArticle.title,
        url: parsedArticle.url,
        sections
      };
    } catch (parserError) {
      // If the comprehensive parser fails, fall back to a simpler direct extraction
      console.error("Comprehensive parser failed, falling back to direct extraction:", parserError);
      
      const $ = cheerio.load(html);
      const sections: ArticleSection[] = [];
      
      // Extract the article title
      const title = $('.content-title').text().trim() ||
                   $('h1').first().text().trim() ||
                   'Untitled Article';
      
      // Find all section divs within the jig-ncbiinpagenav container
      $('.jig-ncbiinpagenav div[id^="article-"]').each((i, el) => {
        const heading = $(el).find('> h2').first().text().trim();
        
        // Extract the content HTML
        let sectionContent = '';
        $(el).children().each((j, child) => {
          if (j > 0) { // Skip the heading
            sectionContent += $.html(child);
          }
        });
        
        // Add the section if it has a non-empty heading and isn't a duplicate
        if (heading && heading.trim() && !sections.some(s => s.heading === heading)) {
          sections.push({
            heading: heading,
            content: sectionContent,
            level: 2
          });
        }
      });
      
      return {
        title,
        url,
        sections
      };
    }
  } catch (error) {
    throw new ParsingError(`Failed to extract article content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Filters out unwanted sections from the article content
 * @param content The article content to filter
 * @returns Filtered article content
 */
export function filterSections(content: ArticleContent): ArticleContent {
  // List of section headings to exclude (case-insensitive)
  const excludedSections = [
    'references',
    'author information',
    'copyright',
    'disclosure',
    'article information',
    'Objectives',
    'Continuing Education Activity',
    'Enhancing Healthcare Team Outcomes',
    'Review Questions'
  ];
  
  // Filter out unwanted sections
  const filteredSections = content.sections.filter(section => {
    const heading = section.heading.toLowerCase();
    return !excludedSections.some(excluded => heading.includes(excluded.toLowerCase()));
  });
  
  return {
    ...content,
    sections: filteredSections
  };
}

/**
 * Extracts tables from HTML content
 * @param html The HTML content containing tables
 * @returns Array of HTML table elements
 */
export function extractTables(html: string): string[] {
  try {
    const $ = cheerio.load(html);
    const tables: string[] = [];
    
    $('table').each((i, element) => {
      tables.push($.html(element));
    });
    
    return tables;
  } catch (error) {
    throw new ParsingError(`Failed to extract tables: ${error instanceof Error ? error.message : String(error)}`);
  }
}