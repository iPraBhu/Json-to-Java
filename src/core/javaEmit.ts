import { GeneratorOptions } from './options';
import { JavaClass, JavaField, JavaModel, JavaType } from './model';

interface EmitContext {
  options: GeneratorOptions;
  indent: string;
}

const indentLines = (text: string, level: number): string => {
  const prefix = '  '.repeat(level);
  return text
    .split('\n')
    .map((line) => (line.length > 0 ? `${prefix}${line}` : line))
    .join('\n');
};

const typeToString = (type: JavaType): string => {
  switch (type.kind) {
    case 'primitive':
      return type.name;
    case 'special':
      return 'Object';
    case 'reference':
    case 'enum':
      return type.name;
    case 'optional':
      return `Optional<${typeToString(type.of)}>`;
    case 'array':
      return `${type.collection}<${typeToString(type.elementType)}>`;
    case 'map':
      return `Map<${type.keyType}, ${typeToString(type.valueType)}>`;
    default:
      return 'Object';
  }
};

const fieldAnnotation = (field: JavaField, options: GeneratorOptions): string | null => {
  if (field.jsonName === field.name) {
    return null;
  }
  if (options.annotations === 'jackson') {
    return `@JsonProperty(${JSON.stringify(field.jsonName)})`;
  }
  if (options.annotations === 'gson') {
    return `@SerializedName(${JSON.stringify(field.jsonName)})`;
  }
  if (options.annotations === 'moshi') {
    return `@Json(name = ${JSON.stringify(field.jsonName)})`;
  }
  return null;
};

const emitField = (field: JavaField, context: EmitContext, accessModifier: 'private' | 'public'): string => {
  const lines: string[] = [];
  const annotation = fieldAnnotation(field, context.options);
  if (annotation) {
    lines.push(annotation);
  }
  const description = field.description?.trim();
  if (description) {
    lines.push('/**');
    lines.push(` * ${description.replace(/\n/g, '\n * ')}`);
    lines.push(' */');
  }
  const access = accessModifier === 'private' ? 'private ' : 'public ';
  lines.push(`${access}${typeToString(field.type)} ${field.name};`);
  return lines.join('\n');
};

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const getterName = (field: JavaField): string => {
  const prefix = field.type.kind === 'primitive' && (field.type.name === 'boolean' || field.type.name === 'Boolean') ? 'is' : 'get';
  return `${prefix}${capitalize(field.name)}`;
};

const setterName = (field: JavaField): string => `set${capitalize(field.name)}`;

const emitAccessorMethods = (field: JavaField, context: EmitContext): string => {
  const getter = `public ${typeToString(field.type)} ${getterName(field)}() {\n  return ${field.name};\n}`;
  const setter = `public void ${setterName(field)}(${typeToString(field.type)} ${field.name}) {\n  this.${field.name} = ${field.name};\n}`;
  return [getter, setter].map((block) => indentLines(block, 1)).join('\n\n');
};

const collectImportsFromType = (type: JavaType, imports: Set<string>, options: GeneratorOptions): void => {
  if (type.kind === 'array') {
    if (type.collection === 'List') {
      imports.add('java.util.List');
    } else {
      imports.add('java.util.Set');
    }
    collectImportsFromType(type.elementType, imports, options);
  }
  if (type.kind === 'optional') {
    imports.add('java.util.Optional');
    collectImportsFromType(type.of, imports, options);
  }
  if (type.kind === 'reference') {
    if (type.name === 'OffsetDateTime') {
      imports.add('java.time.OffsetDateTime');
    }
    if (type.name === 'Date') {
      imports.add('java.util.Date');
    }
  }
  if (type.kind === 'primitive') {
    if (type.name === 'BigDecimal') {
      imports.add('java.math.BigDecimal');
    }
  }
};

const collectImports = (javaClass: JavaClass, options: GeneratorOptions): Set<string> => {
  const imports = new Set<string>();
  for (const field of javaClass.fields) {
    collectImportsFromType(field.type, imports, options);
    const annotation = fieldAnnotation(field, options);
    if (annotation) {
      if (options.annotations === 'jackson') {
        imports.add('com.fasterxml.jackson.annotation.JsonProperty');
      } else if (options.annotations === 'gson') {
        imports.add('com.google.gson.annotations.SerializedName');
      } else if (options.annotations === 'moshi') {
        imports.add('com.squareup.moshi.Json');
      }
    }
  }
  for (const annotation of javaClass.annotations) {
    if (annotation.startsWith('@JsonIgnoreProperties')) {
      imports.add('com.fasterxml.jackson.annotation.JsonIgnoreProperties');
    }
    if (annotation === '@Data') {
      imports.add('lombok.Data');
    }
    if (annotation === '@Builder') {
      imports.add('lombok.Builder');
    }
  }
  if (!options.useLombokData && options.fieldAccess === 'private') {
    // No extra imports required
  }
  javaClass.innerClasses.forEach((inner) => {
    collectImports(inner, options).forEach((item) => imports.add(item));
  });
  return imports;
};

const emitEnum = (enumName: string, values: string[]): string => {
  const body = values.map((value) => value).join(', ');
  return `public enum ${enumName} { ${body} }`;
};

const emitClassBody = (javaClass: JavaClass, context: EmitContext): string => {
  const lines: string[] = [];
  const accessModifier = 'public';
  const classSignature = `${accessModifier} class ${javaClass.name}`;
  const annotations = javaClass.annotations.join('\n');
  if (annotations) {
    lines.push(annotations);
  }
  lines.push(`${classSignature} {`);

  const fieldBlocks = javaClass.fields.map((field) => indentLines(emitField(field, context, context.options.fieldAccess), 1));
  if (fieldBlocks.length > 0) {
    lines.push(fieldBlocks.join('\n\n'));
  }

  if (!context.options.useLombokData && context.options.fieldAccess === 'private') {
    const accessors = javaClass.fields
      .map((field) => emitAccessorMethods(field, context))
      .filter(Boolean)
      .join('\n\n');
    if (accessors) {
      lines.push(accessors);
    }
  }

  for (const innerEnum of javaClass.enums) {
    lines.push(indentLines(emitEnum(innerEnum.name, innerEnum.values.map((entry) => entry.name)), 1));
  }

  for (const innerClass of javaClass.innerClasses) {
    lines.push(indentLines(emitClassBody(innerClass, context), 1));
  }

  lines.push('}');
  return lines.join('\n\n');
};

const emitClassFile = (
  javaClass: JavaClass,
  model: JavaModel,
  options: GeneratorOptions,
  packageName?: string
): string => {
  const context: EmitContext = { options, indent: '  ' };
  const parts: string[] = [];
  if (packageName) {
    parts.push(`package ${packageName};\n`);
  }
  const imports = collectImports(javaClass, options);
  if (imports.size > 0) {
    parts.push(Array.from(imports).sort().map((item) => `import ${item};`).join('\n'));
    parts.push('');
  }
  parts.push(emitClassBody(javaClass, context));
  return parts.filter(Boolean).join('\n\n');
};

export const emitJavaFiles = (model: JavaModel, options: GeneratorOptions): Record<string, string> => {
  const packageName = options.packageName;
  const files: Record<string, string> = {};
  const emitted = new Set<string>();

  const emitClassAndNested = (javaClass: JavaClass) => {
    if (javaClass.nested) {
      return;
    }
    const source = emitClassFile(javaClass, model, options, packageName);
    files[`${javaClass.name}.java`] = source;
    emitted.add(javaClass.name);
  };

  emitClassAndNested(model.root);

  model.classes.forEach((javaClass, name) => {
    if (!emitted.has(name)) {
      emitClassAndNested(javaClass);
    }
  });

  return files;
};
