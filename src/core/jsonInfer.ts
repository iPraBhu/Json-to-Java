import { GeneratorOptions } from './options';
import { InferredShape } from './model';

const guessNumberType = (value: number): 'integer' | 'number' => {
  return Number.isInteger(value) ? 'integer' : 'number';
};

const isIsoDateString = (value: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(value);
};

const mergeShapes = (a: InferredShape, b: InferredShape): InferredShape => {
  if (a.type === b.type) {
    if (a.type === 'object' && a.properties && b.properties) {
      const merged: Record<string, InferredShape> = { ...a.properties };
      for (const [key, value] of Object.entries(b.properties)) {
        if (merged[key]) {
          merged[key] = mergeShapes(merged[key], value);
        } else {
          merged[key] = value;
        }
      }
      return { ...a, properties: merged };
    }
    if (a.type === 'array' && a.items && b.items) {
      return { ...a, items: mergeShapes(a.items, b.items) };
    }
    return a;
  }
  return { type: 'any' };
};

const inferArray = (value: unknown[], options: GeneratorOptions): InferredShape => {
  if (value.length === 0) {
    return { type: 'array', items: { type: 'any' } };
  }
  if (options.arrayInference === 'strict') {
    return { type: 'array', items: inferShape(value[0], options) };
  }
  const items = value.map((item) => inferShape(item, options));
  const merged = items.reduce((acc, item) => mergeShapes(acc, item));
  return { type: 'array', items: merged };
};

export const inferShape = (value: unknown, options: GeneratorOptions): InferredShape => {
  if (value === null || value === undefined) {
    return { type: 'null' };
  }

  if (Array.isArray(value)) {
    return inferArray(value, options);
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const properties: Record<string, InferredShape> = {};
    for (const [key, child] of entries) {
      properties[key] = inferShape(child, options);
      properties[key].required = child !== undefined && child !== null;
    }
    return { type: 'object', properties };
  }

  if (typeof value === 'number') {
    return { type: guessNumberType(value) };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  if (typeof value === 'string') {
    const shape: InferredShape = { type: 'string' };
    if (isIsoDateString(value)) {
      shape.format = 'date-time';
    }
    return shape;
  }

  return { type: 'any' };
};

export const inferModelFromJson = (json: string, options: GeneratorOptions): InferredShape => {
  const data = JSON.parse(json);
  return inferShape(data, options);
};
