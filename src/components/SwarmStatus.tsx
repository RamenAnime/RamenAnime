import { useSwarm } from "@/hooks/useSwarm";
import { Badge } from "@/components/ui/badge";
import { Radio, Users } from "lucide-react";

interface SwarmStatusProps {
  listingId?: number;
  showGlobal?: boolean;
}

export default function SwarmStatus({ listingId, showGlobal = false }: SwarmStatusProps) {
  const { swarmData, isConnected } = useSwarm();

  if (!isConnected || !swarmData) return null;

  // Count viewers for specific listing
  const listingViewers = listingId
    ? swarmData.topListings.find(([id]) => id === String(listingId))?.[1] || 0
    : 0;

  // Global active users
  const activeUsers = swarmData.activeUsers;

  if (showGlobal) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Radio className="h-3 w-3 text-green-500 animate-pulse" />
        <span>{activeUsers} users active</span>
      </div>
    );
  }

  if (listingViewers === 0) return null;

  return (
    <Badge variant="outline" className="text-xs flex items-center gap-1 bg-green-500/10 border-green-500/20 text-green-600">
      <Users className="h-3 w-3" />
      {listingViewers} viewing now
    </Badge>
  );
}
