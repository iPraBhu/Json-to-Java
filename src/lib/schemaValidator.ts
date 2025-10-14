import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export interface SchemaValidationResult {
  ok: boolean;
  errors?: ErrorObject[];
}

export const validateJsonSchema = (schemaText: string): SchemaValidationResult => {
  try {
    const schemaJson = JSON.parse(schemaText);
    ajv.compile(schemaJson);
    return { ok: true };
  } catch (error) {
    if ('errors' in (error as any) && Array.isArray((error as any).errors)) {
      return { ok: false, errors: (error as any).errors as ErrorObject[] };
    }
    return { ok: false, errors: [] };
  }
};
