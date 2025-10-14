import { describe, expect, it } from 'vitest';
import { optionsSchema } from '../core/options';

describe('optionsSchema', () => {
  it('rejects invalid package names', () => {
    expect(() => optionsSchema.parse({ packageName: 'Invalid-Package' })).toThrowError();
  });

  it('allows partial overrides', () => {
    const result = optionsSchema.parse({ rootClassName: 'Order' });
    expect(result.rootClassName).toBe('Order');
  });
});
