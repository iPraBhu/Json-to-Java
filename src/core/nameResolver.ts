const javaReserved = new Set([
  'abstract',
  'assert',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'extends',
  'final',
  'finally',
  'float',
  'for',
  'goto',
  'if',
  'implements',
  'import',
  'instanceof',
  'int',
  'interface',
  'long',
  'native',
  'new',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'strictfp',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'try',
  'void',
  'volatile',
  'while'
]);

const splitPattern = /[^A-Za-z0-9]+/;

const capitalize = (segment: string): string => {
  if (!segment) {
    return '';
  }
  const lower = segment.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const sanitizeSegment = (segment: string): string => segment.replace(/[^A-Za-z0-9]/g, '');

export const toPascalCase = (value: string): string => {
  if (!value) {
    return 'Pojo';
  }
  const segments = value.split(splitPattern).map(sanitizeSegment).filter(Boolean);
  if (segments.length === 0) {
    return 'Pojo';
  }
  return segments.map(capitalize).join('');
};

export const toCamelCase = (value: string): string => {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

export const sanitizeJavaIdentifier = (value: string, options?: { pascal?: boolean }): string => {
  const trimmed = value.trim();
  const candidate = options?.pascal ? toPascalCase(trimmed) : toCamelCase(trimmed || 'value');
  const safe = candidate.replace(/^[^A-Za-z_]+/, '');
  const normalized = safe || (options?.pascal ? 'Pojo' : 'value');
  const lower = normalized.toLowerCase();
  if (javaReserved.has(lower)) {
    return `${normalized}${options?.pascal ? 'Value' : 'Value'}`;
  }
  return normalized;
};

export const sanitizePackageName = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  const parts = value
    .split('.')
    .map((part) => part.toLowerCase().replace(/[^a-z0-9_]/g, ''))
    .filter(Boolean);
  const sanitized = parts.map((part) => (part === '' ? 'pkg' : part)).join('.');
  return sanitized || undefined;
};

export const ensureUniqueName = (baseName: string, used: Set<string>): string => {
  let name = baseName;
  let counter = 1;
  while (used.has(name)) {
    name = `${baseName}${counter}`;
    counter += 1;
  }
  used.add(name);
  return name;
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`);
  return `{${entries.join(',')}}`;
};

export const fingerprint = (value: unknown): string => {
  try {
    return stableStringify(value);
  } catch (error) {
    return `error:${(error as Error).message}`;
  }
};
