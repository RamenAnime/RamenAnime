import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ 
  title = 'No items found', 
  description = 'Try adjusting your filters or check back later.',
  action 
}: EmptyStateProps) {
  return (
    <div className="py-12 text-center space-y-3">
      <Inbox className="h-12 w-12 text-muted-foreground mx-auto" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
