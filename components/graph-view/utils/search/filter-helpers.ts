import type { GraphLink as DataLink } from '../data/data-manager';
import { isMetadata } from '../data/relationship-utils';
import type { ParsedQuery } from './query-parser';

export type BasicNode = {
  id: string;
  title?: string | null;
  summary?: string | null;
  type?: string | null;
  metadata?: { tags?: unknown } | null;
  tags?: unknown;
};

export function collectTags(node: BasicNode): string[] {
  const out: string[] = [];
  const meta = node.metadata;
  if (meta && Array.isArray(meta.tags)) {
    for (const t of meta.tags as unknown[]) {
      if (typeof t === 'string') {
        out.push(t.toLowerCase());
      }
    }
  }
  const legacy = node.tags;
  if (Array.isArray(legacy)) {
    for (const t of legacy as unknown[]) {
      if (typeof t === 'string') {
        out.push(t.toLowerCase());
      }
    }
  }
  return out;
}

export function nodeMatchesFields(
  node: BasicNode,
  summaries: string[],
  tags: string[],
  types: string[]
): boolean {
  const summaryText = (node.summary || '').toLowerCase();
  const typeText = (node.type || '').toLowerCase();
  const metaTags = collectTags(node);
  const hasSummary =
    summaries.length === 0 || summaries.some((q) => summaryText.includes(q));
  if (!hasSummary) {
    return false;
  }
  const hasTag =
    tags.length === 0 || tags.some((q) => metaTags.some((t) => t.includes(q)));
  if (!hasTag) {
    return false;
  }
  const hasType =
    types.length === 0 ||
    types.some((q) => typeText === q || typeText.startsWith(q));
  if (!hasType) {
    return false;
  }
  return true;
}

export function nodeMatchesTerms(
  node: BasicNode,
  terms: string[],
  extras: string
): boolean {
  if (terms.length === 0) {
    return true;
  }
  const title = (node.title || '').toLowerCase();
  const summary = (node.summary || '').toLowerCase();
  const type = (node.type || '').toLowerCase();
  const hay = `${title} ${summary} ${type} ${extras}`;
  for (const term of terms) {
    if (!hay.includes(term)) {
      return false;
    }
  }
  return true;
}

export type MetadataText = {
  tag: string[];
  hyponym: string[];
  hypernym: string[];
  any: string[];
};

function buildTargetsBySource(allLinks: DataLink[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const l of allLinks) {
    const s = typeof l.source === 'string' ? l.source : l.source.id;
    const t = typeof l.target === 'string' ? l.target : l.target.id;
    const existing = map.get(s);
    if (existing) {
      existing.push(t);
    } else {
      map.set(s, [t]);
    }
  }
  return map;
}

function collectLinkedMetadataTexts(
  nodeId: string,
  byId: Map<string, BasicNode>,
  targetsBySource: Map<string, string[]>
): MetadataText {
  const out: MetadataText = { tag: [], hyponym: [], hypernym: [], any: [] };
  const children = targetsBySource.get(nodeId) || [];
  for (const cid of children) {
    const child = byId.get(cid);
    if (!child) {
      continue;
    }
    if (!isMetadata(child.id)) {
      continue;
    }
    const title = (child.title || child.id || '').toLowerCase();
    const type = (child.type || '').toLowerCase();
    out.any.push(`${title} ${type}`);
    if (type.startsWith('tag')) {
      out.tag.push(title);
    } else if (type.startsWith('hyponym')) {
      out.hyponym.push(title);
    } else if (type.startsWith('hypernym')) {
      out.hypernym.push(title);
    }
  }
  return out;
}

export function buildMetadataTextIndex(
  allNodes: BasicNode[],
  allLinks: DataLink[]
): Map<string, MetadataText> {
  const byId = new Map(allNodes.map((n) => [n.id, n] as const));
  const targetsBySource = buildTargetsBySource(allLinks);
  const result = new Map<string, MetadataText>();
  for (const n of allNodes) {
    const meta = collectLinkedMetadataTexts(n.id, byId, targetsBySource);
    result.set(n.id, meta);
  }
  return result;
}

function includesSome(haystack: string, needles: string[]): boolean {
  if (needles.length === 0) {
    return true;
  }
  for (const n of needles) {
    if (haystack.includes(n)) {
      return true;
    }
  }
  return false;
}

function includesAll(haystack: string, needles: string[]): boolean {
  if (needles.length === 0) {
    return true;
  }
  for (const n of needles) {
    if (!haystack.includes(n)) {
      return false;
    }
  }
  return true;
}

export function nodeMatchesParsedQuery(
  node: BasicNode,
  parsed: ParsedQuery,
  localTagTexts: string[],
  linkedMeta: MetadataText
): boolean {
  const titleText = (node.title || '').toLowerCase();
  const summaryText = (node.summary || '').toLowerCase();
  const typeText = (node.type || '').toLowerCase();

  // Fielded
  if (!includesSome(titleText, parsed.fields.title)) {
    return false;
  }
  if (!includesSome(summaryText, parsed.fields.summary)) {
    return false;
  }
  const metaHay =
    `${localTagTexts.join(' ')} ${linkedMeta.any.join(' ')}`.trim();
  if (!includesSome(metaHay, parsed.fields.tag)) {
    return false;
  }
  if (
    !(
      parsed.fields.hyponym.length === 0 ||
      parsed.fields.hyponym.some((q) =>
        linkedMeta.hyponym.some((t) => t.includes(q))
      )
    )
  ) {
    return false;
  }
  if (
    !(
      parsed.fields.hypernym.length === 0 ||
      parsed.fields.hypernym.some((q) =>
        linkedMeta.hypernym.some((t) => t.includes(q))
      )
    )
  ) {
    return false;
  }
  if (!includesSome(metaHay, parsed.fields.metadata)) {
    return false;
  }
  if (
    !(
      parsed.fields.type.length === 0 ||
      parsed.fields.type.some((q) => typeText === q || typeText.startsWith(q))
    )
  ) {
    return false;
  }

  // Free terms across all
  const hay = `${titleText} ${summaryText} ${typeText} ${metaHay}`;
  if (!includesAll(hay, parsed.terms)) {
    return false;
  }
  return true;
}
