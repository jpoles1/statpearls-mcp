#!/usr/bin/env bun

/**
 * Compilation script for StatPearls MCP Server
 * 
 * This script compiles the TypeScript source code into platform-specific executables
 * using Bun's compilation feature.
 */

import { join } from "path";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { spawnSync } from "child_process";
import { getCurrentVersion } from "./version.js";

const DIST_DIR = join(import.meta.dir, "..", "dist");
const ENTRY_POINT = join(import.meta.dir, "..", "src", "index.ts");

type Target = "bun-linux-x64" | "bun-windows-x64" | "bun-darwin-x64";

interface CompileOptions {
  target: Target;
  outfile: string;
}

/**
 * Compile an executable for a specific platform
 */
export async function compile(options: CompileOptions): Promise<string> {
  const { target, outfile } = options;
  
  console.log(`Compiling for ${target}...`);
  
  const result = spawnSync("bun", [
    "build",
    ENTRY_POINT,
    "--compile",
    "--minify",
    "--outfile",
    outfile,
    `--target=${target}`,
  ], {
    stdio: "inherit",
  });
  
  if (result.status !== 0) {
    throw new Error(`Compilation failed for ${target}`);
  }
  
  console.log(`Successfully compiled: ${outfile}`);
  return outfile;
}

/**
 * Compile for a specific platform
 */
export async function compileForPlatform(platform: "linux" | "windows" | "darwin"): Promise<string> {
  // Ensure dist directory exists
  if (!existsSync(DIST_DIR)) {
    await mkdir(DIST_DIR, { recursive: true });
  }
  
  const version = getCurrentVersion();
  const baseOutfile = join(DIST_DIR, "statpearls-mcp");
  
  let target: Target;
  let outfile: string;
  
  switch (platform) {
    case "linux":
      target = "bun-linux-x64";
      outfile = `${baseOutfile}-linux-x64`;
      break;
    case "windows":
      target = "bun-windows-x64";
      outfile = `${baseOutfile}-windows-x64.exe`;
      break;
    case "darwin":
      target = "bun-darwin-x64";
      outfile = `${baseOutfile}-darwin-x64`;
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
  
  return compile({ target, outfile });
}

/**
 * Compile executables for all supported platforms
 */
export async function compileAll(): Promise<string[]> {
  // Ensure dist directory exists
  if (!existsSync(DIST_DIR)) {
    await mkdir(DIST_DIR, { recursive: true });
  }
  
  const baseOutfile = join(DIST_DIR, "statpearls-mcp");
  
  const targets = [
    {
      target: "bun-linux-x64" as const,
      outfile: `${baseOutfile}-linux-x64`,
    },
    {
      target: "bun-windows-x64" as const,
      outfile: `${baseOutfile}-windows-x64.exe`,
    },
    {
      target: "bun-darwin-x64" as const,
      outfile: `${baseOutfile}-darwin-x64`,
    },
  ];
  
  const results: string[] = [];
  
  for (const target of targets) {
    try {
      const result = await compile(target);
      results.push(result);
    } catch (error) {
      console.error(`Error compiling for ${target.target}:`, error);
    }
  }
  
  // Also compile the default executable (no platform suffix)
  try {
    const result = await compile({
      target: "bun-linux-x64",
      outfile: baseOutfile,
    });
    results.push(result);
  } catch (error) {
    console.error("Error compiling default executable:", error);
  }
  
  return results;
}

// Parse command line arguments
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === "all") {
    console.log("Compiling for all platforms...");
    await compileAll();
    return;
  }
  
  const platform = args[0];
  if (!["linux", "windows", "darwin"].includes(platform)) {
    console.error(`Invalid platform: ${platform}`);
    console.error("Usage: bun scripts/compile.ts [all|linux|windows|darwin]");
    process.exit(1);
  }
  
  await compileForPlatform(platform as "linux" | "windows" | "darwin");
}

// If this script is run directly, compile with the specified platform
if (import.meta.path === Bun.main) {
  main().catch((error) => {
    console.error("Compilation failed with error:", error);
    process.exit(1);
  });
}