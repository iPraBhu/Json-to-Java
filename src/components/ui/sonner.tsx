import { Toaster as SonnerToaster, ToasterProps } from 'sonner';

export const Toaster: React.FC<ToasterProps> = (props) => {
  return (
    <SonnerToaster
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl border border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70',
          description: 'text-sm',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground'
        }
      }}
      {...props}
    />
  );
};
