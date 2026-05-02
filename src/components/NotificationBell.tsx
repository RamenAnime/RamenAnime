import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, MessageSquare, UserPlus, ShoppingBag, Info } from "lucide-react";

const typeIcons: Record<string, any> = {
  comment: MessageSquare,
  friend_request: UserPlus,
  listing_sold: ShoppingBag,
  system: Info,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = trpc.notification.list.useQuery();
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery();
  const utils = trpc.useUtils();

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unreadCount ? (
          <span className="absolute top-0 right-0 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount ? (
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => markAllRead.mutate()}>
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              ) : null}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!notifications?.length ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = typeIcons[n.type] ?? Info;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 p-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${
                        !n.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        {n.link ? (
                          <Link
                            to={n.link}
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                            onClick={() => !n.isRead && markRead.mutate({ id: n.id })}
                          >
                            View
                          </Link>
                        ) : null}
                      </div>
                      {!n.isRead ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => markRead.mutate({ id: n.id })}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

