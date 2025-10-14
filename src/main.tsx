import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { ThemeProvider } from './state/theme';
import { setupTrustedTypesPolicy } from './lib/trustedTypes';
import { Toaster } from './components/ui/sonner';

setupTrustedTypesPolicy();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster position="top-right" />
    </ThemeProvider>
  </StrictMode>
);
