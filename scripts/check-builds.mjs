#!/usr/bin/env node

/**
 * Build verification script for all apps in the monorepo
 * Checks for build errors across docs, dashboard, and www apps
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const APPS = [
  { name: 'docs', path: 'apps/docs' },
  { name: 'dashboard', path: 'apps/dashboard' },
  { name: 'www', path: 'apps/www' },
];

const ROOT_DIR = process.cwd();

function runBuild(app) {
  console.log(`\n📦 Building ${app.name}...`);
  try {
    execSync('pnpm build', {
      cwd: join(ROOT_DIR, app.path),
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' },
    });
    console.log(`✅ ${app.name} built successfully`);
    return { success: true, app: app.name };
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || error.message;
    console.error(`❌ ${app.name} build failed:`);
    console.error(output);
    return { success: false, app: app.name, error: output };
  }
}

async function main() {
  console.log('🔍 Checking builds across all apps...\n');
  
  // First, ensure dependencies are installed
  console.log('📥 Installing dependencies...');
  try {
    execSync('pnpm install', { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }

  const results = [];
  
  for (const app of APPS) {
    const result = runBuild(app);
    results.push(result);
  }

  console.log('\n📊 Build Summary:');
  console.log('─'.repeat(50));
  
  const failures = results.filter(r => !r.success);
  const successes = results.filter(r => r.success);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.app}`);
  });
  
  console.log('─'.repeat(50));
  console.log(`Total: ${results.length} | ✅ ${successes.length} | ❌ ${failures.length}`);
  
  if (failures.length > 0) {
    console.log('\n❌ Build failures detected. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All builds successful!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});

