import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
