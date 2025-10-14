import { describe, expect, it } from 'vitest';
import { inferModelFromJson } from '../core/jsonInfer';
import { DEFAULT_OPTIONS } from '../core/options';

const sample = JSON.stringify({
  id: 1,
  name: 'Widget',
  tags: ['a', 'b'],
  nested: {
    flag: true
  }
});

describe('inferModelFromJson', () => {
  it('infers object structure from sample JSON', () => {
    const shape = inferModelFromJson(sample, DEFAULT_OPTIONS);
    expect(shape.type).toBe('object');
    expect(shape.properties?.id.type).toBe('integer');
    expect(shape.properties?.tags.type).toBe('array');
    expect(shape.properties?.nested.type).toBe('object');
  });
});
