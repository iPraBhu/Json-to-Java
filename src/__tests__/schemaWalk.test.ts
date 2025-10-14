import { describe, expect, it } from 'vitest';
import { inferModelFromSchema, JsonSchema } from '../core/schemaWalk';
import { DEFAULT_OPTIONS } from '../core/options';

const schema: JsonSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' },
    age: { type: 'integer' },
    child: {
      type: 'object',
      properties: {
        nickname: { type: 'string' }
      }
    }
  }
};

describe('inferModelFromSchema', () => {
  it('creates deterministic shape from schema', () => {
    const shape = inferModelFromSchema(schema, DEFAULT_OPTIONS);
    expect(shape.type).toBe('object');
    expect(shape.properties?.name.required).toBe(true);
    expect(shape.properties?.child.type).toBe('object');
  });
});
