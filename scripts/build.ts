#!/usr/bin/env bun

/**
 * Build script for StatPearls MCP Server
 *
 * This script bundles the TypeScript source code into a single JavaScript file
 * that can run with vanilla Node.js without requiring Bun.
 *
 * It also supports building for different environments (development, production)
 * and includes version information from package.json.
 */

import { join } from "path";
import { mkdir, chmod } from "fs/promises";
import { existsSync } from "fs";
import { getCurrentVersion } from "./version.js";

const DIST_DIR = join(import.meta.dir, "..", "dist");
const ENTRY_POINT = join(import.meta.dir, "..", "src", "index.ts");
const OUTPUT_FILE = join(DIST_DIR, "index.js");

interface BuildOptions {
  minify?: boolean;
  sourcemap?: boolean | "external";
  target?: "node" | "browser" | "bun";
  environment?: "development" | "production";
}

async function build(options: BuildOptions = {}) {
  const {
    minify = true,
    sourcemap = "external",
    target = "node",
    environment = "production",
  } = options;

  const version = getCurrentVersion();
  console.log(`Building StatPearls MCP Server v${version} (${environment})...`);
  
  // Ensure dist directory exists
  if (!existsSync(DIST_DIR)) {
    console.log(`Creating directory: ${DIST_DIR}`);
    await mkdir(DIST_DIR, { recursive: true });
  }
  
  // Define environment variables to be replaced in the build
  const define = {
    "process.env.NODE_ENV": JSON.stringify(environment),
    "process.env.VERSION": JSON.stringify(version),
  };
  
  // Bundle the application
  console.log(`Bundling from entry point: ${ENTRY_POINT}`);
  const result = await Bun.build({
    entrypoints: [ENTRY_POINT],
    outdir: DIST_DIR,
    target,
    minify,
    sourcemap,
    define,
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
  
  return OUTPUT_FILE;
}

// If this script is run directly, build with default options
if (import.meta.path === Bun.main) {
  const environment = process.argv.includes("--dev") ? "development" : "production";
  const minify = !process.argv.includes("--no-minify");
  
  build({
    environment,
    minify,
  }).catch((error) => {
    console.error("Build failed with error:", error);
    process.exit(1);
  });
}

export { build };