import { Node } from 'fumadocs-core/source';

/**
 * Custom transformer to support sidebar_label in frontmatter
 * This allows shorter sidebar text different from page title
 */
export function sidebarLabelTransformer() {
  return {
    name: 'sidebar-label',
    file(node: Node, filePath?: string) {
      if (filePath?.endsWith('.mdx')) {
        try {
          const fs = require('node:fs');
          const path = require('node:path');
          const contentDir = path.join(process.cwd(), 'content');
          const fullPath = path.join(contentDir, filePath);

          if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const sidebarMatch = content.match(/sidebar_label:\s*(.+)/);
            if (sidebarMatch) {
              const sidebarLabel = sidebarMatch[1].replace(/^["']|["']$/g, '');
              return {
                ...node,
                name: sidebarLabel,
              };
            }
          }
        } catch (_error) {
          // Fail silently if file can't be read
        }
      }
      return node;
    },
  };
}

