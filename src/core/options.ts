import { z } from 'zod';

const packageNamePattern = /^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*$/;
const classNamePattern = /^[A-Z][A-Za-z0-9_]*$/;

export const optionsSchema = z
  .object({
    packageName: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((value) => (value ? value : undefined))
      .refine((value) => !value || packageNamePattern.test(value), {
        message: 'Package name must be a valid Java package identifier.'
      }),
    rootClassName: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .default('Root')
      .refine((value) => classNamePattern.test(value), {
        message: 'Root class name must start with an uppercase letter and contain only alphanumerics or underscores.'
      }),
    fieldAccess: z.enum(['private', 'public']).default('private'),
    useLombokData: z.boolean().default(true),
    useLombokBuilder: z.boolean().default(false),
    annotations: z.enum(['none', 'jackson', 'gson', 'moshi']).default('jackson'),
    collectionType: z.enum(['list', 'set']).default('list'),
    dateType: z.enum(['java-time', 'util-date']).default('java-time'),
    nullStrategy: z.enum(['boxed', 'optional']).default('boxed'),
    generateEnums: z.boolean().default(true),
    stableNames: z.boolean().default(true),
    arrayInference: z.enum(['strict', 'tolerant']).default('tolerant'),
    numberStrategy: z.enum(['integer', 'long', 'double']).default('double'),
    innerClasses: z.boolean().default(false)
  })
  .strict();

export type GeneratorOptions = z.infer<typeof optionsSchema>;

export const DEFAULT_OPTIONS: GeneratorOptions = optionsSchema.parse({});
