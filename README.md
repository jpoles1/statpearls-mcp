# StatPearls MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server that fetches disease information from [StatPearls](https://www.ncbi.nlm.nih.gov/books/NBK430685/), a trusted source of peer-reviewed medical content.

Give your AI system a relaible source of medical knowledge for its next conversation.

## Features

- Searches for diseases and medical conditions on StatPearls
- Retrieve comprehensive, reliable medical information from StatPearls
- Convert HTML content to well-formatted Markdown to make it AI-friendly
- Integrates with AI models via the Model Context Protocol

### If you don't already have a Model Context Protocol (MCP) client:

If you are a casual user, you can use [Claude Desktop](https://modelcontextprotocol.io/quickstart/user) to get started using MCP servers. It is a free and open-source desktop application that allows you to run MCP servers locally and connect to them.

If you are a power user/developer, I recommend using VSCode with the [RooCode](https://docs.roocode.com/) extension which enables you to connect in [MCP servers](https://docs.roocode.com/features/mcp/what-is-mcp) to your development environment for infinite possibilities!

## Installation

Once you have an MCP-capable AI client, you can run this server locally.

The easiest way to get up and running is to download the appropriate executable/binary for your OS from the [releases page](https://github.com/jpoles1/statpearls-mcp/releases). This will give you a self-contained executable that you can run without any additional setup.

Place this executable in a directory of your choice. Then simply add the following to your `mcp_settings.json` file:

```json
{
  "mcpServers": {
    ...
    "statpearls": {
      "command": "{path_to_executable_here}/statpearls-mcp.exe"
    },
    ...
  }
}
```

### For Developers:

You can also run the server from source. This requires [Bun](https://bun.sh/) to be installed on your system.
  1. Clone the repository
  2. Install dependencies (`bun install`)
  3. Compile the server (`bun run build`)
  4. Now you can add the server to your `mcp_settings.json` file:
  ```json
  {
    "mcpServers": {
      ...
      "statpearls": {
        "command": "node",
        "args": [
          "{path_to_proj_here}/dist/index.js"
        ]
      },
      ...
    }
  }
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
├── src/                         # Source code
│   ├── index.ts                 # Main entry point and server setup
│   ├── test-html-parser.ts      # Test utility for HTML parser
│   ├── test-statpearls-parser.ts # Test utility for StatPearls parser
│   ├── testrun.ts               # Test runner utility
│   ├── tools/                   # Tool definitions and handlers
│   │   └── statpearls.ts        # StatPearls tool definition and handler
│   ├── services/                # Core functionality services
│   │   ├── search.ts            # Search functionality
│   │   ├── content.ts           # Content retrieval and processing
│   │   └── markdown.ts          # HTML to Markdown conversion
│   ├── types/                   # Type definitions
│   │   ├── index.ts             # Common type definitions
│   │   └── statpearls.ts        # StatPearls-specific type definitions
│   └── utils/                   # Utility functions
│       ├── html.ts              # HTML parsing utilities
│       ├── error.ts             # Error handling utilities
│       └── statpearls-parser.ts # StatPearls content parsing utilities
├── scripts/                     # Build and utility scripts
│   ├── build.ts                 # Build script for creating Node.js compatible bundle
│   ├── compile.ts               # Script for compiling executables
│   ├── release.ts               # Script for handling releases
│   └── version.ts               # Script for managing versioning
├── dist/                        # Build output directory (not in repository)
├── package.json                 # Project configuration and dependencies
├── tsconfig.json                # TypeScript configuration
├── bun.lock                     # Bun dependency lock file
├── README.md                    # Main project documentation
└── RELEASE-PROCESS.md           # Documentation for release process
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
