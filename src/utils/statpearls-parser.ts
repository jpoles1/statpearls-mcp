/**
 * StatPearls HTML Parser
 * 
 * This module provides functions for parsing StatPearls HTML content
 * and extracting structured data according to the defined types.
 */

import * as cheerio from 'cheerio';
import { ParsingError } from './error.js';
import type {
  StatPearlsArticle,
  Author,
  PublicationDetails,
  Section,
  Subsection,
  Figure,
  Table,
  Reference,
  Objectives,
  StatPearlsSearchResult
} from '../types/statpearls.js';

/**
 * Extract the article ID (NBK number) from a StatPearls URL or HTML content
 * @param input URL or HTML content
 * @returns The NBK ID or null if not found
 */
export function extractArticleId(input: string): string | null {
  // Try to extract from URL
  const urlMatch = input.match(/\/books\/NBK(\d+)/);
  if (urlMatch) {
    return `NBK${urlMatch[1]}`;
  }
  
  // Try to extract from HTML meta tags
  const $ = cheerio.load(input);
  const metaContent = $('meta[name="ncbi_acc"]').attr('content');
  if (metaContent) {
    return metaContent;
  }
  
  return null;
}

/**
 * Extract the title from StatPearls HTML
 * @param $ Cheerio instance
 * @returns The article title
 */
function extractTitle($: cheerio.CheerioAPI): string {
  // Try the specific selector first
  let title = $('h1[id^="_NBK"] span.title').text().trim();
  
  // Fallback to other potential selectors
  if (!title) {
    title = $('h1 span.title').text().trim();
  }
  if (!title) {
    title = $('h1').first().text().trim();
  }
  if (!title) {
    title = $('title').text().trim().replace(' - StatPearls - NCBI Bookshelf', '');
  }
  
  return title || 'Untitled Article';
}

/**
 * Extract authors from StatPearls HTML
 * @param $ Cheerio instance
 * @returns Array of Author objects
 */
function extractAuthors($: cheerio.CheerioAPI): Author[] {
  const authors: Author[] = [];
  
  // Extract author names
  $('p.contrib-group span[itemprop="author"]').each((i, el) => {
    authors.push({
      name: $(el).text().trim()
    });
  });
  
  // Try to extract affiliations if available
  const affiliationsDiv = $('div[id$="_ai__"]');
  if (affiliationsDiv.length > 0) {
    affiliationsDiv.find('div.affiliation').each((i, el) => {
      if (i < authors.length) {
        authors[i].affiliation = $(el).text().replace(/^\d+\s+/, '').trim();
      }
    });
  }
  
  return authors;
}

/**
 * Extract publication details from StatPearls HTML
 * @param $ Cheerio instance
 * @returns PublicationDetails object
 */
function extractPublicationDetails($: cheerio.CheerioAPI): PublicationDetails {
  const details: PublicationDetails = {
    lastUpdate: '',
    publisher: 'StatPearls Publishing',
    publicationYear: new Date().getFullYear().toString()
  };
  
  // Extract last update date
  const lastUpdate = $('p.small span[itemprop="dateModified"]').text().trim();
  if (lastUpdate) {
    details.lastUpdate = lastUpdate;
  }
  
  // Extract publication info from the header
  $('div.bk_prnt p').each((i, el) => {
    const text = $(el).text().trim();
    
    // Look for publisher and publication year
    const publisherMatch = text.match(/StatPearls \[Internet\]\. Treasure Island \(FL\): StatPearls Publishing; (\d{4})/);
    if (publisherMatch) {
      details.publicationYear = publisherMatch[1];
      details.publicationLocation = 'Treasure Island (FL)';
    }
  });
  
  return details;
}

/**
 * Extract objectives from StatPearls HTML
 * @param $ Cheerio instance
 * @returns Objectives object or undefined if not found
 */
function extractObjectives($: cheerio.CheerioAPI): Objectives | undefined {
  const objectivesItems: string[] = [];
  
  // Find the objectives section
  const objectivesHeader = $('p:contains("Objectives:")');
  if (objectivesHeader.length > 0) {
    // Get the list items following the objectives header
    const objectivesList = objectivesHeader.next('ul');
    objectivesList.find('li').each((i, el) => {
      objectivesItems.push($(el).text().trim());
    });
    
    return { items: objectivesItems };
  }
  
  return undefined;
}

/**
 * Extract abstract from StatPearls HTML
 * @param $ Cheerio instance
 * @returns Abstract text or undefined if not found
 */
function extractAbstract($: cheerio.CheerioAPI): string | undefined {
  // Find the continuing education activity section (which serves as the abstract)
  const abstractSection = $('div[id$=".s1"]');
  if (abstractSection.length > 0) {
    // Skip the heading and get all paragraph text
    const paragraphs: string[] = [];
    abstractSection.find('> p').each((i, el) => {
      paragraphs.push($(el).text().trim());
    });
    
    return paragraphs.join('\n\n');
  }
  
  return undefined;
}

/**
 * Extract introduction from StatPearls HTML
 * @param $ Cheerio instance
 * @returns Introduction text or undefined if not found
 */
function extractIntroduction($: cheerio.CheerioAPI): string | undefined {
  // Find the introduction section
  const introSection = $('div[id$=".s2"]');
  if (introSection.length > 0) {
    // Skip the heading and get all paragraph text
    const paragraphs: string[] = [];
    introSection.find('> p').each((i, el) => {
      paragraphs.push($(el).text().trim());
    });
    
    return paragraphs.join('\n\n');
  }
  
  return undefined;
}

/**
 * Extract figures from a section
 * @param $ Cheerio instance
 * @param sectionEl The section element
 * @returns Array of Figure objects
 */
function extractFigures($: cheerio.CheerioAPI, sectionEl: any): Figure[] {
  const figures: Figure[] = [];
  
  // Find all figure containers within the section
  $(sectionEl).find('div.floats-group div.iconblock.fig').each((i, el) => {
    const id = $(el).attr('id') || '';
    const imgEl = $(el).find('img.small-thumb');
    const captionEl = $(el).find('p.float-caption');
    
    if (imgEl.length > 0 && captionEl.length > 0) {
      figures.push({
        id,
        caption: captionEl.text().trim(),
        imageUrl: imgEl.attr('src') || '',
        altText: imgEl.attr('alt') || '',
        largeImageUrl: imgEl.attr('src-large') || ''
      });
    }
  });
  
  return figures;
}

/**
 * Extract tables from a section
 * @param $ Cheerio instance
 * @param sectionEl The section element
 * @returns Array of Table objects
 */
function extractTables($: cheerio.CheerioAPI, sectionEl: any): Table[] {
  const tables: Table[] = [];
  
  // Find all table containers within the section
  $(sectionEl).find('div.iconblock.table-wrap').each((i, el) => {
    const id = $(el).attr('id') || '';
    const captionEl = $(el).find('p.float-caption');
    const tableUrl = $(el).find('a.img_link').attr('href') || '';
    
    if (captionEl.length > 0) {
      tables.push({
        id,
        caption: captionEl.text().trim(),
        tableHtml: '', // Actual table HTML would need to be fetched from tableUrl
        tableUrl: tableUrl.startsWith('/') ? `https://www.ncbi.nlm.nih.gov${tableUrl}` : tableUrl
      });
    }
  });
  
  return tables;
}

/**
 * Extract subsections from a section's content
 * @param $ Cheerio instance
 * @param sectionContent The HTML content of the section
 * @returns Array of Subsection objects
 */
function extractSubsections($: cheerio.CheerioAPI, sectionContent: string): Subsection[] {
  const subsections: Subsection[] = [];
  const $content = cheerio.load(sectionContent);
  
  // Find all bold text that might be subsection headings
  $content('p > b').each((i, el) => {
    const title = $content(el).text().trim();
    if (title) {
      // Get the parent paragraph and any following siblings until the next subsection
      const parentP = $content(el).parent();
      let content = parentP.html() || '';
      
      // Remove the title from the content
      content = content.replace(`<b>${title}</b>`, '').trim();
      
      // Get content from following paragraphs until the next subsection
      let nextEl = parentP.next();
      while (nextEl.length > 0 && !nextEl.find('b').length) {
        content += '\n\n' + (nextEl.html() || '');
        nextEl = nextEl.next();
      }
      
      subsections.push({
        title,
        content
      });
    }
  });
  
  return subsections;
}

/**
 * Extract all sections from StatPearls HTML
 * @param $ Cheerio instance
 * @returns Array of Section objects
 */
function extractSections($: cheerio.CheerioAPI): Section[] {
  const sections: Section[] = [];
  
  // Find all section divs
  $('div[id^="article-"][id$=".s"]').each((i, el) => {
    const id = $(el).attr('id') || '';
    const heading = $(el).find('> h2').first().text().trim();
    
    // Skip the abstract and introduction sections as they're handled separately
    if (id.endsWith('.s1') || id.endsWith('.s2')) {
      return;
    }
    
    // Skip the references section as it's handled separately
    if (heading.toLowerCase() === 'references') {
      return;
    }
    
    // Extract the content HTML
    let contentHtml = '';
    $(el).children().each((j, child) => {
      if (j > 0) { // Skip the heading
        contentHtml += $.html(child);
      }
    });
    
    // Extract figures and tables
    const figures = extractFigures($, el);
    const tables = extractTables($, el);
    
    // Extract subsections
    const subsections = extractSubsections($, contentHtml);
    
    // Create the section object
    sections.push({
      id,
      title: heading,
      content: contentHtml,
      subsections,
      figures,
      tables,
      level: 2 // Main sections are h2
    });
  });
  
  return sections;
}

/**
 * Extract references from StatPearls HTML
 * @param $ Cheerio instance
 * @returns Array of Reference objects
 */
function extractReferences($: cheerio.CheerioAPI): Reference[] {
  const references: Reference[] = [];
  
  // Find the references section
  const referencesSection = $('div[id$=".s26"]');
  if (referencesSection.length > 0) {
    // Process each reference in the definition list
    referencesSection.find('dl.temp-labeled-list > dt').each((i, el) => {
      const number = parseInt($(el).text().trim().replace('.', ''), 10);
      const refDiv = $(el).next('dd').find('div.bk_ref');
      const id = refDiv.attr('id') || '';
      const text = refDiv.text().trim();
      
      // Try to extract PMID and PMCID
      let pmid = '';
      let pmcid = '';
      
      const pmidLink = refDiv.find('a[href*="pubmed.ncbi.nlm.nih.gov"]');
      if (pmidLink.length > 0) {
        const pmidMatch = pmidLink.attr('href')?.match(/\/(\d+)$/);
        if (pmidMatch) {
          pmid = pmidMatch[1];
        }
      }
      
      const pmcLink = refDiv.find('a[href*="pmc/articles/PMC"]');
      if (pmcLink.length > 0) {
        const pmcMatch = pmcLink.attr('href')?.match(/PMC(\d+)/);
        if (pmcMatch) {
          pmcid = pmcMatch[1];
        }
      }
      
      references.push({
        id,
        number,
        text,
        pmid,
        pmcid
      });
    });
  }
  
  return references;
}

/**
 * Extract copyright information from StatPearls HTML
 * @param $ Cheerio instance
 * @returns Copyright text
 */
function extractCopyright($: cheerio.CheerioAPI): string {
  const copyrightDiv = $('div.post-content');
  if (copyrightDiv.length > 0) {
    return copyrightDiv.text().trim();
  }
  
  return 'Copyright © StatPearls Publishing LLC.';
}

/**
 * Extract disclosure information from StatPearls HTML
 * @param $ Cheerio instance
 * @returns Array of disclosure statements
 */
function extractDisclosures($: cheerio.CheerioAPI): string[] {
  const disclosures: string[] = [];
  
  $('dl.temp-labeled-list.small p:contains("Disclosure:")').each((i, el) => {
    disclosures.push($(el).text().trim());
  });
  
  return disclosures;
}

/**
 * Parse StatPearls HTML content into a structured article
 * @param html The HTML content to parse
 * @param url The URL of the article
 * @returns Structured StatPearlsArticle object
 */
export function parseStatPearlsArticle(html: string, url: string): StatPearlsArticle {
  try {
    const $ = cheerio.load(html);
    
    // Extract article ID
    const articleId = extractArticleId(url) || extractArticleId(html) || '';
    
    // Extract basic metadata
    const title = extractTitle($);
    const authors = extractAuthors($);
    const publicationDetails = extractPublicationDetails($);
    
    // Extract content sections
    const abstract = extractAbstract($);
    const objectives = extractObjectives($);
    const introduction = extractIntroduction($);
    const sections = extractSections($);
    const references = extractReferences($);
    
    // Extract additional information
    const copyright = extractCopyright($);
    const disclosures = extractDisclosures($);
    
    return {
      title,
      authors,
      publicationDetails,
      abstract,
      objectives,
      introduction,
      sections,
      references,
      copyright,
      disclosures,
      url,
      articleId
    };
  } catch (error) {
    throw new ParsingError(`Failed to parse StatPearls article: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse StatPearls search results HTML
 * @param html The HTML content of the search results page
 * @returns Array of StatPearlsSearchResult objects
 */
export function parseStatPearlsSearchResults(html: string): StatPearlsSearchResult[] {
  try {
    const $ = cheerio.load(html);
    const results: StatPearlsSearchResult[] = [];
    
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
      
      // Try to extract article ID from URL
      let articleId = '';
      const idMatch = url.match(/\/books\/NBK(\d+)/);
      if (idMatch) {
        articleId = `NBK${idMatch[1]}`;
      }
      
      // Try to extract authors if available
      const authors: string[] = [];
      const authorText = $(element).find('.supp').text();
      if (authorText) {
        const authorMatch = authorText.match(/by (.+?)\.?$/);
        if (authorMatch) {
          authorMatch[1].split(',').forEach(author => {
            authors.push(author.trim());
          });
        }
      }
      
      if (title && url) {
        results.push({
          title,
          url,
          description: description || 'No description available',
          authors,
          articleId
        });
      }
    });
    
    return results;
  } catch (error) {
    throw new ParsingError(`Failed to parse StatPearls search results: ${error instanceof Error ? error.message : String(error)}`);
  }
}