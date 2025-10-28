// Import the JSON themes
import minimalAccentDark from '../styles/minimal-accent-dark.json' with {
  type: 'json',
};
import minimalAccentLight from '../styles/minimal-accent-light.json' with {
  type: 'json',
};

/**
 * Fumadocs code highlighting themes
 * Used in source.config.ts for rehypeCodeOptions
 */
export const themes = {
  light: minimalAccentLight as unknown as any,
  dark: minimalAccentDark as unknown as any,
};

export { minimalAccentDark, minimalAccentLight };
