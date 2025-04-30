import fs from 'fs';
import path from 'path';
import { extractArticleContent, filterSections } from './utils/html.js';

// Load the example HTML file
const exampleHtmlPath = path.resolve(process.cwd(), '../example_statpearls_page.html');
const html = fs.readFileSync(exampleHtmlPath, 'utf-8');

// First, let's analyze the HTML structure to understand the sections
import * as cheerio from 'cheerio';
const $ = cheerio.load(html);

console.log('\nAnalyzing HTML structure:');
console.log('------------------------');

// Try different selectors to find the sections
console.log('\nTrying different selectors:');

// 1. Look for divs with IDs containing "article"
const articleDivs = $('div[id*="article"]');
console.log(`Found ${articleDivs.length} divs with IDs containing "article"`);
if (articleDivs.length > 0) {
  console.log('First few article div IDs:');
  articleDivs.slice(0, 5).each((i, el) => {
    console.log(`  ${i+1}. ID: ${$(el).attr('id')}`);
  });
}

// 2. Look for all h2 elements
const h2Elements = $('h2');
console.log(`\nFound ${h2Elements.length} h2 elements`);
if (h2Elements.length > 0) {
  console.log('First few h2 texts:');
  h2Elements.slice(0, 10).each((i, el) => {
    console.log(`  ${i+1}. Text: ${$(el).text().trim()}`);
  });
}

// 3. Look for divs with class containing specific patterns
const contentDivs = $('.jig-ncbiinpagenav div[id]');
console.log(`\nFound ${contentDivs.length} divs with IDs inside .jig-ncbiinpagenav`);
if (contentDivs.length > 0) {
  console.log('First few content div IDs:');
  contentDivs.slice(0, 10).each((i, el) => {
    console.log(`  ${i+1}. ID: ${$(el).attr('id')}, Heading: ${$(el).find('h2').first().text().trim()}`);
  });
}

// Test URL for the article
const url = 'https://www.ncbi.nlm.nih.gov/books/NBK578186/';

// Extract the article content
console.log('Extracting article content...');
try {
  const content = extractArticleContent(html, url);
  const filteredContent = filterSections(content);
  
  // Print the article title
  console.log(`\nArticle Title: ${content.title}`);
  
  // Print the number of sections
  console.log(`\nNumber of sections: ${content.sections.length}`);
  console.log(`Number of filtered sections: ${filteredContent.sections.length}`);
  
  // Print section headings
  console.log('\nSection Headings:');
  content.sections.forEach((section, index) => {
    console.log(`${index + 1}. ${section.heading} (Level: ${section.level})`);
  });
  
  // Save the extracted content to a JSON file for inspection
  const outputPath = path.resolve(process.cwd(), 'extracted_content.json');
  fs.writeFileSync(outputPath, JSON.stringify(filteredContent, null, 2));
  console.log(`\nExtracted content saved to ${outputPath}`);
  
} catch (error) {
  console.error('Error extracting article content:', error);
}