# StatPearls MCP Server

A Model Context Protocol (MCP) server that fetches disease information from StatPearls, a trusted source of peer-reviewed medical content.

## Features

- Search for diseases and medical conditions on StatPearls
- Retrieve comprehensive, reliable medical information
- Convert HTML content to well-formatted Markdown
- Filter out non-essential sections like references and author information
- Easily integrate with LLMs via the Model Context Protocol

"statpearls": {
      "command": "node",
      "args": [
        "/home/jpoles1/dev/statpearls-mcp/dist/index.js"
      ],
      "alwaysAllow": [
        "statpearls_disease_info"
      ]
    },

## Installation

```bash
# Install dependencies
bun install
```

## Usage

### Running with Bun

```bash
# Start the server
bun start
```

### Building for Node.js

```bash
# Build the server
bun run build

# Run the built server with Node.js
node dist/index.js
```

## Tool Definition

The server provides a single tool:

- **statpearls_disease_info**: Fetches comprehensive, reliable medical information about diseases from StatPearls.

### Input Schema

```json
{
  "query": "diabetes",
  "format_options": {
    "includeToc": true,
    "maxLength": 50000
  }
}
```

- `query`: Disease or medical condition to search for (required)
- `format_options`: Optional formatting preferences
  - `includeToc`: Whether to include a table of contents (default: true)
  - `maxLength`: Maximum length of the returned content in characters (default: 50000)

### Example Output

The tool returns formatted Markdown content with:

- Title and source information
- Table of contents (optional)
- Structured sections including etiology, epidemiology, pathophysiology, clinical features, diagnosis, treatment, and prognosis (when available)

## Development

### Project Structure

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
├── scripts/                     # Build and utility scripts
│   └── build.ts                 # Build script for creating Node.js compatible bundle
└── cline_docs/                  # Project documentation
```

### Building and Releasing

#### Building

The build process creates a single JavaScript file that can run with vanilla Node.js:

```bash
# Production build
bun run build
# or
bun run build:prod

# Development build
bun run build:dev
```

This creates a bundled file at `dist/index.js` that includes all dependencies.

#### Compiling Executables

You can compile platform-specific executables using Bun's compilation feature:

```bash
# Compile for all platforms
bun run compile:all

# Compile for specific platforms
bun run compile:linux
bun run compile:windows
bun run compile:mac
```

This creates executable files in the `dist` directory:
- `statpearls-mcp` (default executable)
- `statpearls-mcp-linux-x64` (Linux)
- `statpearls-mcp-windows-x64.exe` (Windows)
- `statpearls-mcp-darwin-x64` (macOS)

#### Releasing

The release process handles versioning, building, compiling, and Git operations:

```bash
# Release a patch version (bug fixes)
bun run release:patch

# Release a minor version (new features, backward compatible)
bun run release:minor

# Release a major version (breaking changes)
bun run release:major
```

This process:
1. Updates the version in package.json
2. Builds the distribution file
3. Compiles executables for all platforms
4. Creates a Git commit with the version number
5. Creates a Git tag for the version
6. Pushes the commit and tag to GitHub

#### Versioning

The project follows semantic versioning. You can check the current version with:

```bash
bun run version
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
