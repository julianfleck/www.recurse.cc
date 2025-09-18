import { normalizeTypeLabel } from "../config/visual-config";

// Standalone display-name resolver for graph-standalone, avoiding cross-project imports.
// Uses the same normalization as icon-config so labels stay consistent.
export function getTypeDisplayName(type: string | null | undefined): string {
  const normalized = normalizeTypeLabel(type || "");
  return normalized;
}
