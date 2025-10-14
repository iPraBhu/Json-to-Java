import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: (props: { value?: string }) =>
    React.createElement('textarea', {
      'data-testid': 'mock-monaco',
      defaultValue: props.value
    }),
  Editor: (props: { value?: string }) =>
    React.createElement('textarea', {
      'data-testid': 'mock-monaco',
      defaultValue: props.value
    })
}));

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: query.includes('dark'),
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false
  });
}
