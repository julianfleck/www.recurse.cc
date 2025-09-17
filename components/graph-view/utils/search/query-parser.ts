export type ParsedQuery = {
  terms: string[];
  fields: {
    title: string[];
    summary: string[];
    tag: string[];
    hyponym: string[];
    hypernym: string[];
    metadata: string[];
    type: string[];
  };
};

type TokenMatch = { key?: string; value?: string; term?: string };

function tokenize(input: string): TokenMatch[] {
  const tokens: TokenMatch[] = [];
  const text = (input || '').trim();
  if (text === '') {
    return tokens;
  }
  const regex = /(\w+):("([^"]*)"|(\S+))|"([^"]+)"|(\S+)/g;
  const processMatch = (res: RegExpMatchArray): void => {
    const key = (res[1] || '').toLowerCase();
    if (key) {
      const val = (res[3] || res[4] || '').toLowerCase();
      if (val) {
        tokens.push({ key, value: val });
      }
      return;
    }
    const qt = (res[5] || '').toLowerCase();
    if (qt) {
      tokens.push({ term: qt });
      return;
    }
    const bare = (res[6] || '').toLowerCase();
    if (bare) {
      tokens.push({ term: bare });
    }
  };
  for (const result of text.matchAll(regex)) {
    processMatch(result);
  }
  return tokens;
}

function applyToken(
  acc: { terms: string[]; fields: ParsedQuery['fields'] },
  token: TokenMatch
): void {
  if (token.term) {
    acc.terms.push(token.term);
    return;
  }
  if (!token.key) {
    return;
  }
  if (!token.value) {
    return;
  }
  const key = token.key;
  const value = token.value;
  switch (key) {
    case 'title':
      acc.fields.title.push(value);
      return;
    case 'summary':
      acc.fields.summary.push(value);
      return;
    case 'tag':
      acc.fields.tag.push(value);
      return;
    case 'hyponym':
      acc.fields.hyponym.push(value);
      return;
    case 'hypernym':
      acc.fields.hypernym.push(value);
      return;
    case 'metadata':
      acc.fields.metadata.push(value);
      return;
    case 'type':
      acc.fields.type.push(value);
      return;
    default:
      // Unknown key:value should be treated as a single free term combining both,
      // but to avoid overmatching, include the colon explicitly so it won't match
      // ordinary words (e.g., "asd:").
      acc.terms.push(`${key}:${value}`);
  }
}

/**
 * Parse a user-entered search query into free terms and field-specific tokens.
 * Supports quoted strings (e.g., summary:"deep learning") and unquoted tokens (e.g., tag:ai).
 * Field keys are case-insensitive. Unknown keys are treated as free text (key:value preserved).
 */
export function parseSearchQuery(input: string): ParsedQuery {
  const terms: string[] = [];
  const fields = {
    title: [] as string[],
    summary: [] as string[],
    tag: [] as string[],
    hyponym: [] as string[],
    hypernym: [] as string[],
    metadata: [] as string[],
    type: [] as string[],
  };

  const tokens = tokenize(input);
  for (const t of tokens) {
    applyToken({ terms, fields }, t);
  }
  return { terms, fields };
}
