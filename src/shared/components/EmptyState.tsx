import type { ReactNode } from "react";
import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action
}: EmptyStateProps) {
  const { t } = useTranslation();
  const displayTitle = title ?? t('common.emptyTitle');
  const displayDescription = description ?? t('common.emptyDescription');

  return (
    <div className="py-12 text-center space-y-3">
      <Inbox className="h-12 w-12 text-muted-foreground mx-auto" />
      <h3 className="text-lg font-medium">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground">{displayDescription}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
