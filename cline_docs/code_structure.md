# StatPearls MCP Server Code Structure

This document outlines the key files and their responsibilities for the StatPearls MCP server implementation.

## File Structure

```
statpearls-mcp/
├── src/
│   ├── index.ts                 # Main entry point and server setup
│   ├── tools/                   # Tool definitions and handlers
│   │   └── statpearls.ts        # StatPearls tool definition and handler
│   ├── services/                # Core functionality services
│   │   ├── search.ts            # Search functionality
│   │   ├── content.ts           # Content retrieval and processing
│   │   └── markdown.ts          # HTML to Markdown conversion
│   ├── types/                   # Type definitions
│   │   └── index.ts             # Common type definitions
│   └── utils/                   # Utility functions
│       ├── html.ts              # HTML parsing utilities
│       └── error.ts             # Error handling utilities
├── dist/                        # Build output directory
│   └── index.js                 # Bundled JavaScript file (Node.js compatible)
├── tests/                       # Test files
│   └── statpearls.test.ts       # Tests for StatPearls functionality
└── scripts/                     # Build and utility scripts
    └── build.ts                 # Build script for creating Node.js compatible bundle
```

## Key Files and Responsibilities

### src/index.ts
- Main entry point for the application
- Sets up the MCP server
- Registers tools and request handlers
- Initializes the server connection

### src/tools/statpearls.ts
- Defines the StatPearls tool schema
- Implements the tool handler
- Validates input parameters
- Orchestrates the search, content retrieval, and processing

### src/services/search.ts
- Implements the search functionality
- Constructs the NCBI search URL
- Fetches and parses search results
- Implements relevance scoring and result selection

### src/services/content.ts
- Handles content retrieval from selected article
- Parses HTML content
- Identifies and extracts article sections
- Filters out unwanted sections

### src/services/markdown.ts
- Configures and uses turndown for HTML to Markdown conversion
- Implements custom rules for medical content formatting
- Handles special elements like tables and lists

### src/types/index.ts
- Defines common type definitions used across the application
- Includes interfaces for search results, article content, etc.

### src/utils/html.ts
- Provides utility functions for HTML parsing
- Implements helper methods for DOM traversal and extraction

### src/utils/error.ts
- Defines custom error classes
- Implements error handling utilities

### dist/index.js
- Bundled JavaScript file that runs with vanilla Node.js
- Created during the build process using Bun's bundler
- Contains all dependencies and application code

### scripts/build.ts
- Implements the build process
- Uses Bun's bundler to create a single JavaScript file
- Ensures compatibility with vanilla Node.js
- Handles file permissions for executable output

## Build Process

The build process will:

1. Compile TypeScript to JavaScript
2. Bundle all dependencies into a single file
3. Output a Node.js compatible index.js file in the dist directory
4. Set appropriate permissions for execution

This ensures the server can be easily distributed and run in environments with vanilla Node.js installed, without requiring Bun or other dependencies.