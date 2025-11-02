#!/usr/bin/env node

/**
 * Auto-generate index.ts exports for all components
 * Run this after installing new components with shadcn CLI
 */

import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const COMPONENTS_DIR = join(process.cwd(), 'src/components');
const INDEX_FILE = join(COMPONENTS_DIR, 'index.ts');

async function generateExports() {
  try {
    // Read all files in components directory
    const entries = await readdir(COMPONENTS_DIR, { withFileTypes: true });
    
    const exports = [
      '// Auto-generated exports - DO NOT EDIT MANUALLY',
      '// Run `pnpm generate-exports` to regenerate this file',
      '',
      '// UI Components',
    ];

    // Track what we've exported to avoid duplicates
    const exported = new Set();
    const regularComponents = [];
    const specialDirs = new Map();

    // First pass: collect all .tsx files
    for (const entry of entries) {
      if (entry.name === 'index.ts') continue;
      
      if (entry.isFile() && entry.name.endsWith('.tsx')) {
        const componentName = entry.name.replace(/\.tsx$/, '');
        regularComponents.push(componentName);
        exported.add(componentName);
      }
    }

    // Second pass: collect directories (but skip if we already have a .tsx file with same name)
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && !exported.has(entry.name)) {
        const dirPath = join(COMPONENTS_DIR, entry.name);
        const dirEntries = await readdir(dirPath, { withFileTypes: true });
        const subComponents = dirEntries
          .filter(subEntry => subEntry.isFile() && subEntry.name.endsWith('.tsx'))
          .map(subEntry => subEntry.name.replace(/\.tsx$/, ''))
          .sort();
        
        if (subComponents.length > 0) {
          specialDirs.set(entry.name, subComponents);
        }
      }
    }

    // Sort and add regular component exports
    regularComponents.sort();
    for (const component of regularComponents) {
      exports.push(`export * from './${component}';`);
    }

    // Add special directory exports
    if (specialDirs.size > 0) {
      exports.push('');
      exports.push('// Component variants (directories without top-level .tsx)');
      
      const sortedDirs = Array.from(specialDirs.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      
      for (const [dir, subComponents] of sortedDirs) {
        for (const subComponent of subComponents) {
          exports.push(`export * from './${dir}/${subComponent}';`);
        }
      }
    }

    exports.push('');

    // Write to index.ts
    await writeFile(INDEX_FILE, exports.join('\n'));
    
    const totalComponents = regularComponents.length + Array.from(specialDirs.values()).reduce((acc, subs) => acc + subs.length, 0);
    const totalDirs = Array.from(specialDirs.values()).reduce((acc, subs) => acc + subs.length, 0);
    
    console.log(`✅ Generated exports for ${totalComponents} components`);
    console.log(`   - ${regularComponents.length} regular components`);
    if (totalDirs > 0) {
      console.log(`   - ${totalDirs} variant exports from ${specialDirs.size} directories`);
    }
    console.log(`📝 Updated: ${INDEX_FILE}`);
  } catch (error) {
    console.error('❌ Error generating exports:', error);
    process.exit(1);
  }
}

generateExports();
