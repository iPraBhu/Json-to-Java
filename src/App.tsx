import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { JsonEditor } from './components/editor/JsonEditor';
import { OptionsPanel } from './components/options/OptionsPanel';
import { AppHeader } from './components/layout/AppHeader';
import { FileTree } from './components/output/FileTree';
import { CodePreview } from './components/output/CodePreview';
import { exampleJson, exampleSchema } from './lib/jsonExamples';
import { useTheme } from './state/theme';
import { hydrateOptionsStore, useOptionsStore } from './state/options';
import { useGeneratorWorker } from './hooks/useGeneratorWorker';
import { toast } from 'sonner';
import { validateJsonSchema } from './lib/schemaValidator';
import { createZipBlob, triggerDownload } from './lib/download';
import { formatBytes } from './lib/utils';
import type { InputKind } from './core/model';

const MAX_BYTES = 2 * 1024 * 1024;

const countBytes = (input: string): number => new TextEncoder().encode(input).length;

export default function App() {
  const [activeTab, setActiveTab] = useState<InputKind>('json');
  const [jsonInput, setJsonInput] = useState(exampleJson);
  const [schemaInput, setSchemaInput] = useState(exampleSchema);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string>();
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [meta, setMeta] = useState({ classCount: 0, enumCount: 0 });
  const { theme } = useTheme();
  const { options, hydrated } = useOptionsStore((state) => ({
    options: state.options,
    hydrated: state.hydrated
  }));
  const { generate } = useGeneratorWorker();

  useEffect(() => {
    if (!hydrated) {
      hydrateOptionsStore();
    }
  }, [hydrated]);

  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
    };
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  const selectedCode = selectedFile ? files[selectedFile] : undefined;

  const inputBytes = useMemo(() => {
    const text = activeTab === 'json' ? jsonInput : schemaInput;
    return countBytes(text);
  }, [activeTab, jsonInput, schemaInput]);

  const handleExample = (kind: InputKind) => {
    if (kind === 'json') {
      setJsonInput(exampleJson);
      toast.success('Loaded example JSON.');
    } else {
      setSchemaInput(exampleSchema);
      toast.success('Loaded example schema.');
    }
  };

  const validateInput = () => {
    const text = activeTab === 'json' ? jsonInput : schemaInput;
    if (inputBytes > MAX_BYTES) {
      toast.error(`Input is too large (${formatBytes(inputBytes)}). Limit is 2 MB.`);
      return false;
    }
    try {
      if (activeTab === 'json') {
        JSON.parse(text);
        setDiagnostics([]);
        return true;
      }
      const result = validateJsonSchema(text);
      if (!result.ok) {
        toast.error('Schema validation failed.');
        setDiagnostics((result.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message ?? ''}`));
        return false;
      }
      setDiagnostics([]);
      return true;
    } catch (error) {
      toast.error((error as Error).message);
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!validateInput()) {
      return;
    }
    setIsGenerating(true);
    setDiagnostics([]);
    try {
      const text = activeTab === 'json' ? jsonInput : schemaInput;
      const response = await generate({ kind: activeTab, text, options });
      if (Object.keys(response.files).length === 0) {
        toast.error('No classes generated. Inspect your input and options.');
        return;
      }
      setFiles(response.files);
      const first = Object.keys(response.files)[0];
      setSelectedFile(first);
      setMeta(response.meta);
      setDiagnostics(response.diagnostics);
      toast.success(`Generated ${response.meta.classCount} classes.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (Object.keys(files).length === 0) {
      toast.error('Generate classes before downloading.');
      return;
    }
    try {
      const blob = await createZipBlob(files, options.rootClassName);
      triggerDownload(blob, options.rootClassName);
      toast.success('Download started.');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const metaSummary = useMemo(() => {
    if (!meta.classCount) {
      return 'Awaiting generation.';
    }
    return `${meta.classCount} classes • ${meta.enumCount} enums`;
  }, [meta.classCount, meta.enumCount]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <AppHeader onGenerate={handleGenerate} generating={isGenerating} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Source input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InputKind)}>
                <TabsList>
                  <TabsTrigger value="json">JSON Example</TabsTrigger>
                  <TabsTrigger value="schema">JSON Schema</TabsTrigger>
                </TabsList>
                <TabsContent value="json">
                  <JsonEditor
                    value={jsonInput}
                    onChange={setJsonInput}
                    ariaLabel="JSON example editor"
                    theme={theme}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(countBytes(jsonInput))}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleExample('json')}>
                      Load example
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="schema">
                  <JsonEditor
                    value={schemaInput}
                    onChange={setSchemaInput}
                    ariaLabel="JSON schema editor"
                    theme={theme}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(countBytes(schemaInput))}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleExample('schema')}>
                      Load example
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Input size</span>
                  <span className={inputBytes > MAX_BYTES ? 'text-destructive' : ''}>{formatBytes(inputBytes)} / 2 MB</span>
                </div>
                <p className="mt-1 text-xs">All processing occurs locally. Nothing leaves your browser.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[520px]">
            <CardHeader className="flex flex-col gap-2">
              <CardTitle className="flex items-center justify-between">
                <span>Generated output</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-muted-foreground">{metaSummary}</span>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    Download ZIP
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid h-full gap-4 overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)]">
              <FileTree files={files} selected={selectedFile} onSelect={setSelectedFile} />
              <CodePreview fileName={selectedFile} code={selectedCode} />
            </CardContent>
          </Card>

          {diagnostics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {diagnostics.map((line, index) => (
                    <li key={`diagnostic-${index}`}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
        <OptionsPanel key={hydrated ? 'hydrated' : 'hydrating'} />
      </div>
      <footer className="mt-auto flex flex-col items-center gap-1 rounded-2xl border border-border bg-card/70 px-4 py-3 text-center text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          Built with <span className="text-red-500" aria-hidden="true">❤</span> by Pratik Bhuite.
        </span>
        <span>
          Your data is secure and never leaves your browser—generation happens entirely on-device.
        </span>
      </footer>
    </div>
  );
}
