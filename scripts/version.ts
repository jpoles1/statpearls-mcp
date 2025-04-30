#!/usr/bin/env bun

/**
 * Version management script for StatPearls MCP Server
 * 
 * This script provides utilities for reading and updating the version in package.json
 */

import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

const PACKAGE_JSON_PATH = join(import.meta.dir, "..", "package.json");

/**
 * Read the current version from package.json
 */
export function getCurrentVersion(): string {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
  return packageJson.version || "0.0.0";
}

/**
 * Update the version in package.json
 * @param version The new version to set
 */
export function updateVersion(version: string): void {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
  packageJson.version = version;
  writeFileSync(
    PACKAGE_JSON_PATH,
    JSON.stringify(packageJson, null, 2) + "\n",
    "utf-8"
  );
  console.log(`Updated version to ${version} in package.json`);
}

/**
 * Bump the version according to semantic versioning
 * @param type The type of version bump: 'major', 'minor', or 'patch'
 * @returns The new version
 */
export function bumpVersion(type: "major" | "minor" | "patch"): string {
  const currentVersion = getCurrentVersion();
  const [major, minor, patch] = currentVersion.split(".").map(Number);

  let newVersion: string;
  switch (type) {
    case "major":
      newVersion = `${major + 1}.0.0`;
      break;
    case "minor":
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case "patch":
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      throw new Error(`Invalid version bump type: ${type}`);
  }

  updateVersion(newVersion);
  return newVersion;
}

// If this script is run directly, print the current version
if (import.meta.path === Bun.main) {
  console.log(`Current version: ${getCurrentVersion()}`);
}