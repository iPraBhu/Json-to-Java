import { DEFAULT_OPTIONS, GeneratorOptions, optionsSchema } from './options';
import {
  CollectionType,
  InferredShape,
  InputKind,
  JavaClass,
  JavaEnum,
  JavaField,
  JavaModel,
  JavaType
} from './model';
import { ensureUniqueName, fingerprint, sanitizeJavaIdentifier, sanitizePackageName, toPascalCase } from './nameResolver';
import { inferModelFromJson } from './jsonInfer';
import { inferModelFromSchema, JsonSchema } from './schemaWalk';
import { emitJavaFiles } from './javaEmit';

export interface GenerationRequest {
  kind: InputKind;
  text: string;
  options: GeneratorOptions;
}

export interface GenerationResponse {
  files: Record<string, string>;
  warnings: string[];
  diagnostics: string[];
  meta: {
    classCount: number;
    enumCount: number;
  };
}

interface BuildContext {
  options: GeneratorOptions;
  classes: Map<string, JavaClass>;
  enums: Map<string, JavaEnum>;
  usedNames: Set<string>;
  fingerprints: Map<string, string>;
  warnings: string[];
}

const numericTypeForStrategy = (
  type: 'integer' | 'number',
  options: GeneratorOptions,
  required: boolean
): JavaType => {
  const strategy = options.numberStrategy;
  const asPrimitive = required && options.nullStrategy === 'boxed';
  if (strategy === 'integer') {
    return { kind: 'primitive', name: asPrimitive ? 'int' : 'Integer' };
  }
  if (strategy === 'long') {
    return { kind: 'primitive', name: asPrimitive ? 'long' : 'Long' };
  }
  return { kind: 'primitive', name: asPrimitive ? 'double' : 'Double' };
};

const optionalize = (type: JavaType, optional: boolean, options: GeneratorOptions): JavaType => {
  if (!optional) {
    return type;
  }
  if (options.nullStrategy === 'optional') {
    return { kind: 'optional', of: type };
  }
  if (type.kind === 'primitive') {
    const boxingMap: Record<string, string> = {
      boolean: 'Boolean',
      int: 'Integer',
      long: 'Long',
      double: 'Double',
      float: 'Float',
      short: 'Short',
      byte: 'Byte',
      char: 'Character'
    };
    const boxed = boxingMap[type.name];
    if (boxed) {
      return { kind: 'primitive', name: boxed as any };
    }
  }
  return type;
};

const collectionName = (options: GeneratorOptions): CollectionType =>
  options.collectionType === 'set' ? 'Set' : 'List';

const detectDateType = (shape: InferredShape, options: GeneratorOptions): JavaType | null => {
  if (shape.type === 'string' && shape.format === 'date-time') {
    if (options.dateType === 'java-time') {
      return { kind: 'reference', name: 'OffsetDateTime' };
    }
    return { kind: 'reference', name: 'Date' };
  }
  return null;
};

const createEnum = (
  nameHint: string,
  shape: InferredShape,
  context: BuildContext,
  parentClass?: JavaClass
): JavaType | null => {
  if (!shape.enum || !context.options.generateEnums) {
    return null;
  }
  const enumName = ensureUniqueName(toPascalCase(nameHint), context.usedNames);
  const enumValues = shape.enum.map((value) => {
    const candidate = value.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    const safe = candidate === '' ? 'VALUE' : candidate;
    return {
      name: safe,
      value,
      description: undefined
    };
  });
  const javaEnum: JavaEnum = {
    name: enumName,
    values: enumValues
  };
  context.enums.set(enumName, javaEnum);
  if (parentClass) {
    parentClass.enums.push(javaEnum);
  }
  return { kind: 'enum', name: enumName };
};

const resolveShapeType = (
  shape: InferredShape,
  nameHint: string,
  context: BuildContext,
  parentClass: JavaClass | null,
  required: boolean
): JavaType => {
  if (shape.type === 'array') {
    const elementShape = shape.items ?? { type: 'any' };
    const elementType = resolveShapeType(
      elementShape,
      `${nameHint}Item`,
      context,
      parentClass,
      false
    );
  return {
    kind: 'array',
    elementType,
    collection: collectionName(context.options)
  };
}

  if (shape.type === 'object') {
    const className = buildClass(shape, nameHint, context, parentClass);
    return { kind: 'reference', name: className };
  }

  if (shape.type === 'boolean') {
    return { kind: 'primitive', name: required && context.options.nullStrategy === 'boxed' ? 'boolean' : 'Boolean' };
  }

  if (shape.type === 'integer' || shape.type === 'number') {
    return numericTypeForStrategy(shape.type === 'integer' ? 'integer' : 'number', context.options, required);
  }

  if (shape.type === 'string') {
    const dateType = detectDateType(shape, context.options);
    if (dateType) {
      return dateType;
    }
    const enumType = createEnum(nameHint, shape, context, parentClass ?? undefined);
    if (enumType) {
      return enumType;
    }
    return { kind: 'primitive', name: 'String' };
  }

  if (shape.type === 'null') {
    return { kind: 'special', name: 'Any' };
  }

  return { kind: 'special', name: 'Any' };
};

const buildClass = (
  shape: InferredShape,
  nameHint: string,
  context: BuildContext,
  parentClass: JavaClass | null
): string => {
  const sanitizedName = sanitizeJavaIdentifier(nameHint, { pascal: true });
  const key = fingerprint(shape);

  if (context.options.stableNames && context.fingerprints.has(key)) {
    return context.fingerprints.get(key)!;
  }

  const className = ensureUniqueName(sanitizedName, context.usedNames);

  const javaClass: JavaClass = {
    name: className,
    fields: [],
    annotations: [],
    innerClasses: [],
    enums: [],
    implements: []
  };

  context.classes.set(className, javaClass);
  if (context.options.stableNames) {
    context.fingerprints.set(key, className);
  }

  if (shape.type === 'object' && shape.properties) {
    for (const [jsonName, propShape] of Object.entries(shape.properties)) {
      const fieldName = sanitizeJavaIdentifier(jsonName, { pascal: false });
      const fieldType = resolveShapeType(propShape, toPascalCase(jsonName), context, javaClass, propShape.required ?? false);
      const optional = !(propShape.required ?? false);
      const finalType = optionalize(fieldType, optional, context.options);
      javaClass.fields.push({
        name: fieldName,
        jsonName,
        type: finalType,
        required: !optional,
        description: propShape.description,
        example: propShape.examples?.[0]
      });
    }
  }

  if (parentClass && context.options.innerClasses) {
    javaClass.nested = true;
    parentClass.innerClasses.push(javaClass);
  }

  applyClassLevelAnnotations(javaClass, context.options);

  return className;
};

function applyClassLevelAnnotations(javaClass: JavaClass, options: GeneratorOptions): void {
  const ensureAnnotation = (annotation: string) => {
    if (!javaClass.annotations.includes(annotation)) {
      javaClass.annotations.push(annotation);
    }
  };

  if (options.annotations === 'jackson') {
    ensureAnnotation('@JsonIgnoreProperties(ignoreUnknown = true)');
  }

  if (options.useLombokData) {
    ensureAnnotation('@Data');
  }

  if (options.useLombokBuilder) {
    ensureAnnotation('@Builder');
  }
}

const buildModel = (shape: InferredShape, options: GeneratorOptions): JavaModel => {
  const rootName = sanitizeJavaIdentifier(options.rootClassName || 'Root', { pascal: true });
  const context: BuildContext = {
    options,
    classes: new Map(),
    enums: new Map(),
    usedNames: new Set(),
    fingerprints: new Map(),
    warnings: []
  };

  const rootClassName = buildClass(shape, rootName, context, null);
  const rootClass = context.classes.get(rootClassName);
  if (!rootClass) {
    throw new Error('Failed to build root class.');
  }

  return {
    root: rootClass,
    classes: context.classes,
    enums: context.enums
  };
};

export const generateModel = (request: GenerationRequest): GenerationResponse => {
  const options = optionsSchema.parse({ ...DEFAULT_OPTIONS, ...request.options });
  options.packageName = sanitizePackageName(options.packageName);
  options.rootClassName = sanitizeJavaIdentifier(options.rootClassName, { pascal: true });

  const shape: InferredShape =
    request.kind === 'json'
      ? inferModelFromJson(request.text, options)
      : inferModelFromSchema(JSON.parse(request.text) as JsonSchema, options);

  const model = buildModel(shape, options);
  const files = emitJavaFiles(model, options);

  return {
    files,
    warnings: [],
    diagnostics: [],
    meta: {
      classCount: model.classes.size,
      enumCount: model.enums.size
    }
  };
};
