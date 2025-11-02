import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get monorepo root (two levels up from packages/ui/tailwind.config.ts)
const rootDir = resolve(__dirname, '../..');

const config: Config = {
  // Note: Content paths are now specified via @source directives in CSS files (Tailwind v4 CSS-first approach)
  // Each app's globals.css includes @source directives for its own components and packages/ui
  theme: {
    extend: {
      fontFamily: {
        sans: ['Switzer', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            letterSpacing: '0.015em',
            h1: {
              fontSize: '2.5rem',
              fontWeight: '500',
              lineHeight: '1.1',
              letterSpacing: '0em',
            },
            h2: {
              fontSize: '2rem',
              fontWeight: '500',
              lineHeight: '1.2',
              letterSpacing: '0em',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '500',
              lineHeight: '1.3',
              letterSpacing: '0.01em',
            },
            h4: {
              fontSize: '1.25rem',
              fontWeight: '500',
              lineHeight: '1.4',
              letterSpacing: '0.01em',
            },
            p: {
              fontSize: '1rem',
              lineHeight: '1.7',
              fontWeight: '300',
              letterSpacing: '0.015em',
            },
            li: {
              letterSpacing: '0.015em',
            },
            code: {
              letterSpacing: '0em',
            },
          },
        },
      },
    },
  },
  plugins: [
    typography,
    // Custom tracking utilities for Switzer font
    ({ addUtilities }) => {
      const newUtilities = {
        '.tracking-switzer-tight': {
          letterSpacing: '0.01em',
        },
        '.tracking-switzer': {
          letterSpacing: '0.015em',
        },
        '.tracking-switzer-wide': {
          letterSpacing: '0.02em',
        },
        '.tracking-switzer-wider': {
          letterSpacing: '0.03em',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;

