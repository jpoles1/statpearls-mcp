# Build Script Reference

This document provides a reference for implementing the build script that will create a vanilla Node.js compatible file from the TypeScript source code.

## File: scripts/build.ts

```typescript
#!/usr/bin/env bun

/**
 * Build script for StatPearls MCP Server
 * 
 * This script bundles the TypeScript source code into a single JavaScript file
 * that can run with vanilla Node.js without requiring Bun.
 */

import { join } from "path";
import { mkdir, chmod } from "fs/promises";
import { existsSync } from "fs";

const DIST_DIR = join(import.meta.dir, "..", "dist");
const ENTRY_POINT = join(import.meta.dir, "..", "src", "index.ts");
const OUTPUT_FILE = join(DIST_DIR, "index.js");

async function build() {
  console.log("Building StatPearls MCP Server...");
  
  // Ensure dist directory exists
  if (!existsSync(DIST_DIR)) {
    console.log(`Creating directory: ${DIST_DIR}`);
    await mkdir(DIST_DIR, { recursive: true });
  }
  
  // Bundle the application
  console.log(`Bundling from entry point: ${ENTRY_POINT}`);
  const result = await Bun.build({
    entrypoints: [ENTRY_POINT],
    outdir: DIST_DIR,
    target: "node",
    minify: true,
    sourcemap: "external",
    naming: {
      entry: "index.js",
    },
  });
  
  if (!result.success) {
    console.error("Build failed:");
    for (const message of result.logs) {
      console.error(`- ${message}`);
    }
    process.exit(1);
  }
  
  console.log(`Successfully built: ${OUTPUT_FILE}`);
  
  // Make the output file executable
  console.log("Setting executable permissions...");
  await chmod(OUTPUT_FILE, 0o755);
  
  console.log("Build completed successfully!");
  console.log(`Run with: node ${OUTPUT_FILE}`);
}

build().catch((error) => {
  console.error("Build failed with error:", error);
  process.exit(1);
});
```

## Usage

To use this build script:

1. Create the `scripts` directory in the project root if it doesn't exist
2. Create a `build.ts` file with the content above
3. Make the script executable: `chmod +x scripts/build.ts`
4. Run the script: `bun scripts/build.ts`

## How It Works

The build script:

1. Defines the entry point (`src/index.ts`) and output location (`dist/index.js`)
2. Creates the `dist` directory if it doesn't exist
3. Uses Bun's built-in bundler to create a single JavaScript file
4. Configures the bundler to target Node.js
5. Enables minification to reduce file size
6. Generates source maps for debugging
7. Sets executable permissions on the output file

## Adding to package.json

Add the following to the `scripts` section in `package.json`:

```json
"scripts": {
  "build": "bun scripts/build.ts"
}
```

This allows running the build with `bun run build`.

## Considerations

- The script targets Node.js to ensure compatibility with vanilla Node.js environments
- Minification reduces file size but may make debugging more difficult
- External source maps are generated to aid debugging while keeping the main file small
- Executable permissions are set to allow running the file directly