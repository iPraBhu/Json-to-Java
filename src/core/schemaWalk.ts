import { GeneratorOptions } from './options';
import { InferredShape } from './model';

export type JsonSchema = {
  $id?: string;
  $ref?: string;
  $defs?: Record<string, JsonSchema>;
  definitions?: Record<string, JsonSchema>;
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema | JsonSchema[];
  description?: string;
  enum?: Array<string | number | boolean | null>;
  format?: string;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  allOf?: JsonSchema[];
  additionalProperties?: boolean | JsonSchema;
  examples?: unknown[];
};

interface SchemaContext {
  root: JsonSchema;
  options: GeneratorOptions;
  seen: Map<string, InferredShape>;
}

const resolveRef = (ref: string, context: SchemaContext): JsonSchema => {
  if (!ref.startsWith('#')) {
    throw new Error(`Only local references are supported (${ref}).`);
  }
  const path = ref.slice(2).split('/');
  let node: any = context.root;
  for (const segment of path) {
    const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');
    if (node && typeof node === 'object' && key in node) {
      node = node[key];
    } else {
      throw new Error(`Unable to resolve schema reference: ${ref}`);
    }
  }
  return node as JsonSchema;
};

const combineShapes = (schemas: JsonSchema[], context: SchemaContext): InferredShape => {
  return schemas.map((schema) => shapeFromSchema(schema, context)).reduce((acc, shape) => {
    if (!acc) {
      return shape;
    }
    if (acc.type === 'object' && shape.type === 'object') {
      const properties: Record<string, InferredShape> = { ...(acc.properties ?? {}) };
      for (const [key, value] of Object.entries(shape.properties ?? {})) {
        if (properties[key]) {
          properties[key] = {
            ...properties[key],
            ...value,
            required: properties[key].required || value.required
          };
        } else {
          properties[key] = value;
        }
      }
      return { type: 'object', properties };
    }
    if (acc.type === 'array' && shape.type === 'array') {
      return { type: 'array', items: shape.items ?? acc.items };
    }
    return acc;
  });
};

const normalizeType = (schema: JsonSchema): string | undefined => {
  const { type } = schema;
  if (!type) {
    return undefined;
  }
  if (Array.isArray(type)) {
    if (type.includes('object')) return 'object';
    if (type.includes('array')) return 'array';
    if (type.includes('string')) return 'string';
    if (type.includes('integer')) return 'integer';
    if (type.includes('number')) return 'number';
    if (type.includes('boolean')) return 'boolean';
    if (type.includes('null')) return 'null';
    return type[0];
  }
  return type;
};

export const shapeFromSchema = (schema: JsonSchema, context: SchemaContext): InferredShape => {
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, context);
    if (context.seen.has(schema.$ref)) {
      return context.seen.get(schema.$ref)!;
    }
    const shape = shapeFromSchema(resolved, context);
    context.seen.set(schema.$ref, shape);
    return shape;
  }

  if (schema.allOf || schema.anyOf || schema.oneOf) {
    const list = schema.allOf || schema.anyOf || schema.oneOf || [];
    return combineShapes(list, context);
  }

  const normalizedType = normalizeType(schema);

  if (normalizedType === 'object' || schema.properties) {
    const properties: Record<string, InferredShape> = {};
    const required = new Set(schema.required ?? []);
    for (const [key, subschema] of Object.entries(schema.properties ?? {})) {
      const child = shapeFromSchema(subschema, context);
      child.required = required.has(key);
      properties[key] = child;
    }
    return {
      type: 'object',
      properties,
      description: schema.description
    };
  }

  if (normalizedType === 'array' || schema.items) {
    const itemsSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
    return {
      type: 'array',
      items: itemsSchema ? shapeFromSchema(itemsSchema, context) : { type: 'any' },
      description: schema.description
    };
  }

  if (normalizedType === 'string') {
    return {
      type: 'string',
      description: schema.description,
      enum: schema.enum?.map((value) => String(value)),
      format: schema.format,
      examples: schema.examples
    };
  }

  if (normalizedType === 'integer' || normalizedType === 'number') {
    return {
      type: normalizedType as 'integer' | 'number',
      description: schema.description,
      enum: schema.enum?.map((value) => String(value))
    };
  }

  if (normalizedType === 'boolean') {
    return {
      type: 'boolean',
      description: schema.description
    };
  }

  if (normalizedType === 'null') {
    return {
      type: 'null',
      description: schema.description
    };
  }

  return { type: 'any', description: schema.description };
};

export const inferModelFromSchema = (schema: JsonSchema, options: GeneratorOptions): InferredShape => {
  const context: SchemaContext = {
    root: schema,
    options,
    seen: new Map()
  };
  return shapeFromSchema(schema, context);
};
