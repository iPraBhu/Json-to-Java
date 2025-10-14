import { Github, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../state/theme';
import { cn } from '../../lib/utils';

const REPO_URL = 'https://github.com/your-org/json-to-pojo';

interface AppHeaderProps {
  onGenerate: () => void;
  generating: boolean;
}

export const AppHeader = ({ onGenerate, generating }: AppHeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const version = import.meta.env.APP_VERSION ?? 'dev';

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <span className="text-xl font-semibold">{'{ }'}</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">json-to-pojo</h1>
          <p className="text-sm text-muted-foreground">Generate clean Java models directly in your browser.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground md:inline">v{version}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className={cn('border border-transparent hover:border-border')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button asChild variant="ghost">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub
          </a>
        </Button>
        <Button onClick={onGenerate} disabled={generating} className="min-w-[120px]">
          {generating ? 'Generating…' : 'Generate POJOs'}
        </Button>
      </div>
    </header>
  );
};
