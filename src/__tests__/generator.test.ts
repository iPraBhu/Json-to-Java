import { describe, expect, it } from 'vitest';
import { generateModel } from '../core/generator';
import { DEFAULT_OPTIONS } from '../core/options';

const input = JSON.stringify({
  name: 'Alice',
  active: true,
  children: [{ name: 'Bob' }]
});

describe('generateModel', () => {
  it('produces Java files from JSON example', () => {
    const response = generateModel({ kind: 'json', text: input, options: DEFAULT_OPTIONS });
    expect(Object.keys(response.files).length).toBeGreaterThan(0);
    const [fileName] = Object.keys(response.files);
    expect(fileName.endsWith('.java')).toBe(true);
  });
});
