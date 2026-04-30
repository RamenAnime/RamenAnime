import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, UserPlus, Clock, Check, X } from "lucide-react";
import TosGate from "@/components/TosGate";

function FriendsContent() {
  const utils = trpc.useUtils();
  const { data: friends, isLoading: friendsLoading } = trpc.social.listFriends.useQuery();
  const { data: requests, isLoading: requestsLoading } = trpc.social.listFriendRequests.useQuery();

  const respondRequest = trpc.social.respondFriendRequest.useMutation({
    onSuccess: () => {
      utils.social.listFriendRequests.invalidate();
      utils.social.listFriends.invalidate();
    },
  });

  const removeFriend = trpc.social.removeFriend.useMutation({
    onSuccess: () => {
      utils.social.listFriends.invalidate();
    },
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container px-4 md:px-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Friends
          </h1>
          <p className="text-sm text-muted-foreground">Manage your connections</p>
        </div>

        {/* Friend Requests */}
        {!requestsLoading && requests && requests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Friend Requests</h2>
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${req.requesterId}`}>
                        <Avatar className="h-10 w-10 border border-primary/20">
                          <AvatarImage src={req.requester?.avatar ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {req.requester?.name?.charAt(0) ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <Link
                          to={`/profile/${req.requesterId}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {req.requester?.name ?? "User"}
                        </Link>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Wants to be friends
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => respondRequest.mutate({ requestId: req.id, accept: true })}
                        disabled={respondRequest.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border/50 text-muted-foreground"
                        onClick={() => respondRequest.mutate({ requestId: req.id, accept: false })}
                        disabled={respondRequest.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            My Friends {friends && <Badge variant="outline" className="ml-2 border-primary/30 text-primary">{friends.length}</Badge>}
          </h2>
          {friendsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card/50 border-border/50 animate-pulse">
                  <CardContent className="p-4 h-16" />
                </Card>
              ))}
            </div>
          ) : friends && friends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friends.map((friend) => (
                <Card key={friend.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${friend.id}`}>
                        <Avatar className="h-12 w-12 border border-primary/20">
                          <AvatarImage src={friend.avatar ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {friend.name?.charAt(0) ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${friend.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors block truncate"
                        >
                          {friend.name ?? "User"}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Link to={`/profile/${friend.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-primary">
                              <UserPlus className="h-3 w-3 mr-1" />
                              Profile
                            </Button>
                          </Link>
                          <Link to="/social">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-primary">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFriend.mutate({ friendId: friend.id })}
                        disabled={removeFriend.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium text-foreground mb-2">No friends yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Visit other profiles and send friend requests to connect!
                </p>
                <Link to="/social">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse Community
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Friends() {
  return (
    <TosGate>
      <FriendsContent />
    </TosGate>
  );
}
