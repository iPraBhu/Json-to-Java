import { FileCode2, FileJson, Package } from 'lucide-react';
import { cn, formatBytes } from '../../lib/utils';

export interface FileTreeProps {
  files: Record<string, string>;
  selected?: string;
  onSelect: (fileName: string) => void;
}

export const FileTree = ({ files, selected, onSelect }: FileTreeProps) => {
  const entries = Object.entries(files);
  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-transparent p-6 text-center text-sm text-muted-foreground">
        <FileCode2 className="h-6 w-6" aria-hidden="true" />
        <p>Generated classes will appear here.</p>
      </div>
    );
  }
  return (
    <ul className="flex h-full flex-col gap-1">
      {entries.map(([name, content]) => {
        const isSelected = selected === name;
        const size = new Blob([content]).size;
        return (
          <li key={name}>
            <button
              type="button"
              onClick={() => onSelect(name)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left text-sm transition-colors hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected && 'border-primary bg-primary/10 text-primary'
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <FileJson className="h-4 w-4" aria-hidden="true" />
                <span className="truncate" title={name}>
                  {name}
                </span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" aria-hidden="true" />
                {formatBytes(size)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
