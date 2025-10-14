import { describe, expect, it } from 'vitest';
import { emitJavaFiles } from '../core/javaEmit';
import { GeneratorOptions, DEFAULT_OPTIONS } from '../core/options';
import { JavaClass, JavaModel } from '../core/model';

const createModel = (): JavaModel => {
  const root: JavaClass = {
    name: 'Sample',
    annotations: ['@Data'],
    fields: [
      {
        name: 'id',
        jsonName: 'id',
        type: { kind: 'primitive', name: 'int' },
        required: true
      },
      {
        name: 'tags',
        jsonName: 'tags',
        type: { kind: 'array', collection: 'List', elementType: { kind: 'primitive', name: 'String' } },
        required: false
      }
    ],
    enums: [],
    innerClasses: [],
    implements: []
  };

  return {
    root,
    classes: new Map([[root.name, root]]),
    enums: new Map()
  };
};

describe('emitJavaFiles', () => {
  it('emits Java source with imports', () => {
    const model = createModel();
    const files = emitJavaFiles(model, { ...DEFAULT_OPTIONS, packageName: 'com.test' } as GeneratorOptions);
    const source = files['Sample.java'];
    expect(source).toContain('package com.test;');
    expect(source).toContain('import java.util.List;');
    expect(source).toContain('public class Sample');
  });
});
