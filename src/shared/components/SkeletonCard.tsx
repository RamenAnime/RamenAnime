import { Card, CardContent } from '@/components/ui/card';

export function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4 space-y-3">
        <div className="h-40 bg-muted rounded-lg" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="flex justify-between">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
