#!/usr/bin/env bun

/**
 * Release script for StatPearls MCP Server
 *
 * This script handles the release process, including:
 * - Bumping the version according to semantic versioning
 * - Creating a Git tag for the release
 * - Pushing the tag to trigger GitHub Actions workflow
 *
 * Note: The actual compilation and release of executables is handled by GitHub Actions
 */

import { bumpVersion, getCurrentVersion } from "./version.js";
import { spawnSync } from "child_process";

/**
 * Execute a Git command
 */
function executeGitCommand(args: string[], captureOutput: boolean = false): { success: boolean; output?: string } {
  console.log(`Executing: git ${args.join(" ")}`);
  
  const result = spawnSync("git", args, {
    stdio: captureOutput ? "pipe" : "inherit",
    encoding: "utf-8",
  });
  
  if (result.status !== 0) {
    console.error(`Git command failed: git ${args.join(" ")}`);
    return { success: false };
  }
  
  return {
    success: true,
    output: captureOutput ? result.stdout : undefined
  };
}

/**
 * Create a release
 */
async function createRelease(type: "major" | "minor" | "patch"): Promise<void> {
  // Bump the version
  const newVersion = bumpVersion(type);
  console.log(`Creating release v${newVersion}...`);
  
  // Git operations
  console.log("\nPerforming Git operations...");
  
  // Check if there are changes to commit
  const statusResult = executeGitCommand(["status", "--porcelain"], true);
  const hasChanges = statusResult.success && statusResult.output && statusResult.output.trim().length > 0;
  
  if (hasChanges) {
    // Stage all changes
    const addResult = executeGitCommand(["add", "."]);
    if (!addResult.success) {
      console.error("Failed to stage changes");
      return;
    }
    
    // Commit changes
    const commitResult = executeGitCommand(["commit", "-m", `Release v${newVersion}`]);
    if (!commitResult.success) {
      console.error("Failed to commit changes");
      return;
    }
    
    // Create tag
    const tagResult = executeGitCommand(["tag", `-a`, `v${newVersion}`, "-m", `Release v${newVersion}`]);
    if (!tagResult.success) {
      console.error("Failed to create tag");
      return;
    }
    
    // Push commit and tag
    const pushCommitResult = executeGitCommand(["push", "origin", "HEAD"]);
    if (!pushCommitResult.success) {
      console.error("Failed to push commit");
      return;
    }
    
    const pushTagResult = executeGitCommand(["push", "origin", `v${newVersion}`]);
    if (!pushTagResult.success) {
      console.error("Failed to push tag");
      return;
    }
    
    console.log(`Git operations completed successfully!`);
  } else {
    console.log("No changes to commit");
  }
  
  console.log(`\nRelease v${newVersion} created successfully!`);
  console.log(`GitHub Actions will now build and release the executables.`);
  console.log(`Check the Actions tab in your GitHub repository for progress.`);
}

// Parse command line arguments
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`Current version: ${getCurrentVersion()}`);
    console.log("Usage: bun scripts/release.ts [major|minor|patch]");
    process.exit(0);
  }
  
  const type = args[0] as "major" | "minor" | "patch";
  if (!["major", "minor", "patch"].includes(type)) {
    console.error(`Invalid version type: ${type}`);
    console.error("Usage: bun scripts/release.ts [major|minor|patch]");
    process.exit(1);
  }
  
  await createRelease(type);
}

main().catch((error) => {
  console.error("Release failed with error:", error);
  process.exit(1);
});