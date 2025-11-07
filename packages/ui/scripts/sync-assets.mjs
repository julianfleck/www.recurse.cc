#!/usr/bin/env node

/**
 * Sync assets from packages/ui/public to each app's public/ui-assets folder
 * This allows Next.js to serve shared assets from a centralized location
 */

import { existsSync, mkdirSync, readdirSync, statSync, symlinkSync, unlinkSync } from "fs";
import { join, relative, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

const UI_PUBLIC_DIR = resolve(__dirname, "../public");
const MONOREPO_ROOT = resolve(__dirname, "../../..");
const APPS = ["www", "docs", "dashboard"];

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function removeSymlink(linkPath) {
  if (existsSync(linkPath)) {
    try {
      const stats = statSync(linkPath);
      if (stats.isSymbolicLink()) {
        unlinkSync(linkPath);
        return true;
      }
    } catch (error) {
      // Ignore errors
    }
  }
  return false;
}

function createSymlink(target, linkPath) {
  ensureDir(resolve(linkPath, ".."));
  removeSymlink(linkPath);
  
  // Use relative path for symlinks to work across different environments
  const relativeTarget = relative(resolve(linkPath, ".."), target);
  
  try {
    symlinkSync(relativeTarget, linkPath, "dir");
    console.log(`✓ Created symlink: ${linkPath} -> ${relativeTarget}`);
  } catch (error) {
    if (error.code === "EEXIST") {
      console.log(`⚠ Symlink already exists: ${linkPath}`);
    } else {
      console.error(`✗ Failed to create symlink: ${linkPath}`, error.message);
    }
  }
}

function syncAssets() {
  if (!existsSync(UI_PUBLIC_DIR)) {
    console.error(`✗ UI public directory not found: ${UI_PUBLIC_DIR}`);
    process.exit(1);
  }

  console.log(`Syncing assets from ${UI_PUBLIC_DIR} to apps...\n`);

  for (const app of APPS) {
    const appPublicDir = resolve(MONOREPO_ROOT, `apps/${app}/public`);
    const uiAssetsDir = join(appPublicDir, "ui-assets");

    if (!existsSync(appPublicDir)) {
      console.log(`⚠ App public directory not found: ${appPublicDir}, skipping...`);
      continue;
    }

    // Create symlink from app's public/ui-assets to packages/ui/public
    createSymlink(UI_PUBLIC_DIR, uiAssetsDir);
  }

  console.log("\n✓ Asset sync complete!");
}

syncAssets();

