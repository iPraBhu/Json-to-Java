export type CollectionType = 'List' | 'Set';

export type JavaPrimitive =
  | 'String'
  | 'boolean'
  | 'Boolean'
  | 'int'
  | 'Integer'
  | 'long'
  | 'Long'
  | 'double'
  | 'Double'
  | 'BigDecimal'
  | 'float'
  | 'Float'
  | 'short'
  | 'Short'
  | 'byte'
  | 'Byte'
  | 'char'
  | 'Character';

export type JavaSpecialType = 'Object' | 'JsonNode' | 'Any';

export type JavaType =
  | { kind: 'primitive'; name: JavaPrimitive }
  | { kind: 'special'; name: JavaSpecialType }
  | { kind: 'array'; collection: CollectionType; elementType: JavaType }
  | { kind: 'map'; keyType: 'String'; valueType: JavaType }
  | { kind: 'reference'; name: string }
  | { kind: 'enum'; name: string }
  | { kind: 'optional'; of: JavaType };

export interface JavaEnumValue {
  name: string;
  value: string;
  description?: string;
}

export interface JavaEnum {
  name: string;
  values: JavaEnumValue[];
  description?: string;
}

export interface JavaField {
  name: string;
  jsonName: string;
  type: JavaType;
  required: boolean;
  description?: string;
  example?: unknown;
}

export interface JavaClass {
  name: string;
  description?: string;
  fields: JavaField[];
  innerClasses: JavaClass[];
  enums: JavaEnum[];
  annotations: string[];
  implements: string[];
  extends?: string;
  nested?: boolean;
}

export interface JavaModel {
  root: JavaClass;
  classes: Map<string, JavaClass>;
  enums: Map<string, JavaEnum>;
}

export type InputKind = 'json' | 'schema';

export interface InferredShape {
  type: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'any';
  description?: string;
  required?: boolean;
  enum?: string[];
  properties?: Record<string, InferredShape>;
  items?: InferredShape;
  examples?: unknown[];
  format?: string;
}
