/**
 * Centralized asset paths for shared assets across all apps
 * 
 * Assets are stored in packages/ui/public/ and should be:
 * - Symlinked or copied to each app's public folder during build
 * - Or accessed via Next.js rewrites/config
 */

const ASSETS_BASE = '/ui-assets';

export const assets = {
  logos: {
    recurse: `${ASSETS_BASE}/logos/recurse-logo.svg`,
  },
  fonts: {
    switzer: {
      variable: `${ASSETS_BASE}/fonts/Switzer/Switzer-Variable.woff2`,
      variableItalic: `${ASSETS_BASE}/fonts/Switzer/Switzer-VariableItalic.woff2`,
    },
  },
} as const;

/**
 * Get the full path to an asset
 * In production, this will resolve to the app's public folder
 * In development, may need to use rewrites or symlinks
 */
export function getAssetPath(path: string): string {
  // For now, return the path as-is
  // Apps should symlink packages/ui/public to their public/ui-assets folder
  // Or use Next.js rewrites to serve from the package
  return path;
}

