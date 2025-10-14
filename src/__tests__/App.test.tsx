import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import { ThemeProvider } from '../state/theme';

vi.mock('../hooks/useGeneratorWorker', () => ({
  useGeneratorWorker: () => ({
    generate: vi.fn().mockResolvedValue({
      files: {},
      warnings: [],
      diagnostics: [],
      meta: { classCount: 0, enumCount: 0 }
    })
  })
}));

describe('App', () => {
  it('renders editors and options', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );
    expect(screen.getByText(/Source input/i)).toBeInTheDocument();
    expect(screen.getByText(/Generation Options/i)).toBeInTheDocument();
  });
});
