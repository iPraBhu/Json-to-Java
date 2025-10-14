import { useCallback, useMemo } from 'react';
import Editor, { BeforeMount, Monaco } from '@monaco-editor/react';
import { cn } from '../../lib/utils';

export interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  readOnly?: boolean;
  height?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

const beforeMount: BeforeMount = (monaco: Monaco) => {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: true,
    enableSchemaRequest: false,
    validate: true
  });
  monaco.editor.defineTheme('json-to-pojo-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0f172a'
    }
  });
  monaco.editor.defineTheme('json-to-pojo-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#f8fafc'
    }
  });
};

export const JsonEditor = ({ value, onChange, ariaLabel, readOnly, height = 420, className, theme = 'dark' }: JsonEditorProps) => {
  const handleChange = useCallback(
    (next: string | undefined) => {
      onChange(next ?? '');
    },
    [onChange]
  );

  const options = useMemo(
    () => ({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular',
      tabSize: 2,
      readOnly,
      automaticLayout: true,
      renderWhitespace: 'none' as const,
      wordWrap: 'on' as const,
      contextmenu: true,
      domReadOnly: readOnly,
      matchBrackets: 'always' as const
    }),
    [readOnly]
  );

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border shadow-inner', className)}>
      <Editor
        height={height}
        defaultLanguage="json"
        path="input.json"
        theme={theme === 'dark' ? 'json-to-pojo-dark' : 'json-to-pojo-light'}
        beforeMount={beforeMount}
        onChange={handleChange}
        value={value}
        options={options}
        aria-label={ariaLabel}
      />
    </div>
  );
};
