import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../core/generator', async (importOriginal) => {
  const original = await importOriginal<typeof import('../core/generator')>();
  return {
    ...original,
    generateModel: vi.fn(() => ({
      files: { 'Sample.java': 'public class Sample {}' },
      warnings: [],
      diagnostics: [],
      meta: { classCount: 1, enumCount: 0 }
    }))
  };
});

describe('generator worker', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('posts messages with result payload', async () => {
    const postMessage = vi.fn();
    (globalThis as any).self = {
      postMessage,
      addEventListener: vi.fn((_: string, handler: (event: MessageEvent) => void) => {
        (globalThis as any).__handler = handler;
      })
    };
    await import('../workers/generator.worker');
    const handler = (globalThis as any).__handler;
    expect(typeof handler).toBe('function');
    await handler({
      data: {
        requestId: 'abc',
        kind: 'json',
        text: '{}',
        options: {}
      }
    });
    expect(postMessage).toHaveBeenCalledTimes(1);
    const message = postMessage.mock.calls[0][0];
    expect(message.success).toBe(true);
    expect(message.requestId).toBe('abc');
  });
});
