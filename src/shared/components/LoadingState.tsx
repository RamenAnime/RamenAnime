import { Loader2 } from 'lucide-react';
import i18n from 'i18next';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingState({ message, fullPage = false }: LoadingStateProps) {
  const label = message ?? i18n.t('a11y.loading');
  const content = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center">
      {content}
    </div>
  );
}
