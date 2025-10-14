import Editor from '@monaco-editor/react';
import { Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../state/theme';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface CodePreviewProps {
  fileName?: string;
  code?: string;
}

export const CodePreview = ({ fileName, code }: CodePreviewProps) => {
  const { theme } = useTheme();

  const handleCopy = useCallback(() => {
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Copy failed. Please try again.'));
  }, [code]);

  if (!fileName || !code) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-transparent p-6 text-center text-sm text-muted-foreground">
        Select a file from the list to preview its generated source code.
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
        <span className="text-sm font-medium">{fileName}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} aria-label="Copy Java source">
          <Copy className="h-4 w-4" aria-hidden="true" />
          Copy
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          language="java"
          value={code}
          loading="Loading preview..."
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 0,
            smoothScrolling: true,
            renderWhitespace: 'none',
            lineNumbersMinChars: 3,
            wordWrap: 'on',
            automaticLayout: true
          }}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
};
