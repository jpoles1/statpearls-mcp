# StatPearls HTML Parser

This project provides tools for analyzing and parsing StatPearls medical articles from HTML into structured data. It includes a detailed HTML structure analysis, TypeScript type definitions, and a parser implementation.

## Project Structure

- `statpearls_html_analysis.md` - Detailed analysis of the HTML structure of StatPearls articles
- `src/types/statpearls.ts` - TypeScript type definitions for StatPearls article data
- `src/utils/statpearls-parser.ts` - Parser implementation for extracting structured data from StatPearls HTML
- `src/test-statpearls-parser.ts` - Test file demonstrating how to use the parser

## HTML Structure Analysis

The `statpearls_html_analysis.md` file contains a comprehensive analysis of the HTML structure of StatPearls articles, including:

- Title, authors, and publication details
- Abstract and introduction
- Section and subsection structure
- Special elements like tables, figures, and references
- Other structured content

For each element, the analysis provides:
- The HTML structure
- Reliable CSS selectors or XPath expressions
- Examples from the sample article

## Type Definitions

The `src/types/statpearls.ts` file defines TypeScript interfaces for the structured data extracted from StatPearls articles:

- `StatPearlsArticle` - The complete article structure
- `Author` - Author information
- `PublicationDetails` - Publication metadata
- `Section` - Article sections
- `Subsection` - Subsections within sections
- `Figure` - Figures and images
- `Table` - Tables
- `Reference` - References and citations
- `Objectives` - Article objectives
- `StatPearlsSearchResult` - Search result structure

## Parser Implementation

The `src/utils/statpearls-parser.ts` file implements functions for parsing StatPearls HTML content:

- `parseStatPearlsArticle` - Parses a complete article into a structured object
- `parseStatPearlsSearchResults` - Parses search results into structured objects
- Helper functions for extracting specific elements (title, authors, sections, etc.)

The parser uses the Cheerio library for HTML parsing and provides robust error handling.

## Usage

The `src/test-statpearls-parser.ts` file demonstrates how to use the parser:

```typescript
import * as fs from 'fs';
import { parseStatPearlsArticle } from './utils/statpearls-parser.js';

// Read the HTML file
const html = fs.readFileSync('example_statpearls_page.html', 'utf-8');

// Parse the HTML content
const article = parseStatPearlsArticle(
  html, 
  'https://www.ncbi.nlm.nih.gov/books/NBK578186/'
);

// Use the structured article data
console.log(`Title: ${article.title}`);
console.log(`Authors: ${article.authors.map(a => a.name).join(', ')}`);

// Save the parsed article as JSON
fs.writeFileSync(
  'parsed_article.json', 
  JSON.stringify(article, null, 2), 
  'utf-8'
);
```

## Running the Test

To run the test file:

```bash
# Compile TypeScript files
npm run build

# Run the test
node dist/test-statpearls-parser.js
```

This will parse the example StatPearls article and output information about the extracted content.

## Integration with MCP Server

This parser can be integrated with the StatPearls MCP server to provide structured medical content through the MCP protocol. The parser extracts comprehensive information from StatPearls articles, making it suitable for various applications:

- Medical knowledge bases
- Clinical decision support systems
- Medical education platforms
- Research databases

## Limitations and Considerations

- The parser is designed specifically for StatPearls articles and may not work with other sources.
- HTML structure changes on the StatPearls website may require updates to the parser.
- Some elements like tables are referenced by URL and may require additional fetching for complete content.
- The parser does not currently handle interactive elements or multimedia content beyond static images.