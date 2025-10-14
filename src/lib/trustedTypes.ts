const POLICY_NAME = 'json-to-pojo#default';

export interface TrustedTypesPolicy {
  createHTML(input: string): TrustedHTML;
  createScriptURL?(input: string): TrustedScriptURL;
}

let cachedPolicy: TrustedTypePolicy | null = null;

const trustedTypesFactory = typeof window !== 'undefined' ? (window as Window & {
  trustedTypes?: TrustedTypePolicyFactory;
}).trustedTypes : undefined;

const ensurePolicy = (): TrustedTypePolicy | null => {
  if (!trustedTypesFactory) {
    return null;
  }
  if (cachedPolicy) {
    return cachedPolicy;
  }
  if (typeof (trustedTypesFactory as any).getPolicy === 'function') {
    const existing = (trustedTypesFactory as any).getPolicy(POLICY_NAME) as TrustedTypePolicy | undefined;
    if (existing) {
      cachedPolicy = existing;
      return cachedPolicy;
    }
  }
  cachedPolicy = trustedTypesFactory.createPolicy(POLICY_NAME, {
    createHTML: (input) => input,
    createScriptURL: (input) => input,
    createScript: (input) => input
  });
  return cachedPolicy;
};

export const setupTrustedTypesPolicy = (): void => {
  ensurePolicy();
};

export const toTrustedHTML = (value: string): TrustedHTML | string => {
  const policy = ensurePolicy();
  return policy ? policy.createHTML(value) : value;
};

export const toTrustedScriptURL = (value: string): TrustedScriptURL | string => {
  const policy = ensurePolicy();
  return policy && policy.createScriptURL ? policy.createScriptURL(value) : value;
};
