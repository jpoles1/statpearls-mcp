/**
 * Test file for StatPearls parser
 * 
 * This file demonstrates how to use the StatPearls parser to extract
 * structured content from a StatPearls HTML article.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseStatPearlsArticle } from './utils/statpearls-parser.js';

// Path to the example StatPearls HTML file
const exampleFilePath = path.join(process.cwd(), 'example_statpearls_page.html');

// Read the HTML file
console.log(`Reading file: ${exampleFilePath}`);
const html = fs.readFileSync(exampleFilePath, 'utf-8');

// Parse the HTML content
console.log('Parsing StatPearls article...');
const article = parseStatPearlsArticle(
  html, 
  'https://www.ncbi.nlm.nih.gov/books/NBK578186/'
);

// Output basic information about the parsed article
console.log('\n=== StatPearls Article ===');
console.log(`Title: ${article.title}`);
console.log(`Authors: ${article.authors.map(a => a.name).join(', ')}`);
console.log(`Last Update: ${article.publicationDetails.lastUpdate}`);
console.log(`Article ID: ${article.articleId}`);

// Output section information
console.log('\n=== Sections ===');
article.sections.forEach((section, index) => {
  console.log(`${index + 1}. ${section.title}`);
  
  if (section.subsections.length > 0) {
    console.log('   Subsections:');
    section.subsections.forEach(subsection => {
      console.log(`   - ${subsection.title}`);
    });
  }
  
  if (section.figures.length > 0) {
    console.log('   Figures:');
    section.figures.forEach(figure => {
      console.log(`   - ${figure.caption.substring(0, 50)}...`);
    });
  }
  
  if (section.tables.length > 0) {
    console.log('   Tables:');
    section.tables.forEach(table => {
      console.log(`   - ${table.caption.substring(0, 50)}...`);
    });
  }
});

// Output reference information
console.log('\n=== References ===');
console.log(`Total references: ${article.references.length}`);
console.log('First 3 references:');
article.references.slice(0, 3).forEach(ref => {
  console.log(`${ref.number}. ${ref.text.substring(0, 100)}...`);
});

// Save the parsed article as JSON for inspection
const outputPath = path.join(process.cwd(), 'parsed_statpearls_article.json');
fs.writeFileSync(
  outputPath, 
  JSON.stringify(article, null, 2), 
  'utf-8'
);
console.log(`\nParsed article saved to: ${outputPath}`);