# Memory Bank

## Product Context
- **Why this project exists**: This project aims to create an MCP (Model Context Protocol) server that fetches disease information from StatPearls, making medical knowledge easily accessible to LLMs.
- **What problems it solves**: It provides structured, reliable medical information from a trusted source (StatPearls) to LLMs, enabling them to give more accurate medical information without hallucinations.
- **How it should work**: The server accepts a disease query, searches StatPearls via NCBI, selects the most relevant result, retrieves the full content, converts it to markdown (excluding standard sections like References and Author Information), and returns the formatted information to the LLM.

## Active Context
- **What you're working on now**: Fixed GitHub Actions workflow for releases.
- **Recent changes**:
  - Updated GitHub Actions workflow to use latest versions of actions (v4 instead of v3)
  - Fixed "Missing download info for actions/upload-artifact@v3" error
  - Updated RELEASE-PROCESS.md with more detailed workflow information
  - Previously:
    - Created GitHub Actions workflow for building and releasing executables
    - Updated .gitignore to exclude executables from Git
    - Modified release script to focus on version bumping and tagging
    - Created script to clean executables from Git history
- **Next steps**:
  - Run the clean-git-history.sh script to remove executables from Git history
  - Push changes to GitHub
  - Test the new release process by creating a new release

## System Patterns
- **How the system is built**: The system is built as an MCP server using the @modelcontextprotocol/sdk.
- **Key technical decisions**:
  1. Using Bun as the JavaScript runtime for better performance and bundling capabilities
  2. Using turndown for HTML to markdown conversion
  3. Implementing the server as a stdio-based MCP server for easy integration
  4. Keeping dependencies minimal for portability
- **Architecture patterns**: The server follows the MCP server pattern with tool definitions and handlers.

## Tech Context
- **Technologies used**:
  - Bun: JavaScript runtime
  - TypeScript: Programming language
  - @modelcontextprotocol/sdk: For MCP server implementation
  - turndown: For HTML to markdown conversion
  - GitHub Actions: For automated builds and releases
- **Development setup**:
  - Install dependencies with `bun install`
  - Run the server with `bun run index.ts`
- **Technical constraints**:
  - The server should be lightweight and portable
  - Dependencies should be minimized
  - The implementation should be bundled into a single executable file
  - Executables are built and released via GitHub Actions, not stored in Git

## Progress
- **What works**: All core functionality for the StatPearls MCP server is implemented.
- **What's left to build**: Testing, optimization, and potential enhancements.
- **Progress status**: Implementation is complete and ready for testing.