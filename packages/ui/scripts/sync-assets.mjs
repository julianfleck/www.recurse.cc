#!/usr/bin/env node

/**
 * Sync assets from packages/ui/public to each app's public/ui-assets folder
 * This allows Next.js to serve shared assets from a centralized location
 * 
 * In CI/Vercel environments, files are copied instead of symlinked
 * to ensure compatibility with build systems that don't handle symlinks well
 */

import { cpSync, existsSync, mkdirSync, statSync, symlinkSync, unlinkSync, rmSync } from "fs";
import { join, relative, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

const UI_PUBLIC_DIR = resolve(__dirname, "../public");
const MONOREPO_ROOT = resolve(__dirname, "../../..");
const APPS = ["www", "docs", "dashboard"];

// Detect CI/Vercel environment
const isCI = process.env.CI === "true" || process.env.VERCEL === "1" || process.env.VERCEL_ENV !== undefined;

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

function removeDir(dirPath) {
  if (existsSync(dirPath)) {
    try {
      rmSync(dirPath, { recursive: true, force: true });
      return true;
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

function copyAssets(target, destPath) {
  ensureDir(resolve(destPath, ".."));
  removeDir(destPath);
  removeSymlink(destPath);
  
  try {
    cpSync(target, destPath, { recursive: true });
    console.log(`✓ Copied assets: ${target} -> ${destPath}`);
  } catch (error) {
    console.error(`✗ Failed to copy assets: ${destPath}`, error.message);
    throw error;
  }
}

function syncAssets() {
  if (!existsSync(UI_PUBLIC_DIR)) {
    console.error(`✗ UI public directory not found: ${UI_PUBLIC_DIR}`);
    process.exit(1);
  }

  const method = isCI ? "copying" : "symlinking";
  console.log(`Syncing assets from ${UI_PUBLIC_DIR} to apps (${method})...\n`);

  for (const app of APPS) {
    const appPublicDir = resolve(MONOREPO_ROOT, `apps/${app}/public`);
    const uiAssetsDir = join(appPublicDir, "ui-assets");

    if (!existsSync(appPublicDir)) {
      console.log(`⚠ App public directory not found: ${appPublicDir}, skipping...`);
      continue;
    }

    // In CI/Vercel, copy files instead of symlinking
    if (isCI) {
      copyAssets(UI_PUBLIC_DIR, uiAssetsDir);
    } else {
      // Create symlink from app's public/ui-assets to packages/ui/public
      createSymlink(UI_PUBLIC_DIR, uiAssetsDir);
    }
  }

  console.log("\n✓ Asset sync complete!");
}

syncAssets();

