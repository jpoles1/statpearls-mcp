# StatPearls MCP Server Release Process

This document describes the release process for the StatPearls MCP Server.

## Overview

The StatPearls MCP Server uses GitHub Actions for automated builds and releases. When a new version is released, GitHub Actions automatically builds executables for all supported platforms (Linux, Windows, and macOS) and attaches them to the GitHub release.

## Release Process

1. Make your changes to the codebase
2. Run the release script with the appropriate version bump type:
   ```
   bun run scripts/release.ts [major|minor|patch]
   ```
   This will:
   - Bump the version in package.json
   - Commit the changes
   - Create a Git tag
   - Push the changes and tag to GitHub

3. GitHub Actions will automatically:
   - Build the executables for all platforms
   - Create a GitHub release
   - Attach the executables to the release

4. Once the GitHub Actions workflow completes, you can download the executables from the GitHub release page.

## Development Workflow

1. Install dependencies:
   ```
   bun install
   ```

2. Make your changes to the codebase

3. Build the JavaScript bundle:
   ```
   bun run scripts/build.ts
   ```

4. Test your changes locally

5. When ready to release, follow the release process above

## Supported Platforms

The StatPearls MCP Server is built for the following platforms:

- Linux (x64)
- Windows (x64)
- macOS (x64)

## GitHub Actions Workflow

The GitHub Actions workflow is defined in `.github/workflows/build-and-release.yml`. It is triggered when a new tag is pushed to the repository.

The workflow:
1. Builds the JavaScript bundle
2. Compiles executables for all supported platforms
3. Creates a GitHub release
4. Attaches the executables to the release

### Workflow Implementation Details

The workflow uses the following GitHub Actions:
- `actions/checkout@v4`: Checks out the repository code
- `oven-sh/setup-bun@v1`: Sets up Bun for building and compiling
- `actions/upload-artifact@v4`: Uploads compiled executables as artifacts
- `actions/download-artifact@v4`: Downloads artifacts for release
- `softprops/action-gh-release@v1`: Creates a GitHub release with the executables

The workflow is split into two jobs:
1. `build`: Compiles executables for each platform (Linux, Windows, macOS)
2. `release`: Creates a GitHub release and attaches the executables

If you encounter any issues with the workflow, check the GitHub Actions logs for details.