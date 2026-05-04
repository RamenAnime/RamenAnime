import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Shield, MessageSquare, ShoppingBag, Heart, BarChart3, Trash2, Crown, X, Check, Ban, Unlock } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "20" }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { user: me, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });
  const { data: userList } = trpc.admin.listUsers.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });
  const { data: postList } = trpc.admin.listPosts.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });
  const { data: listingList } = trpc.admin.listListings.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });
  const { data: donationList } = trpc.admin.listDonations.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });

  const utils = trpc.useUtils();
  const deletePost = trpc.admin.deletePost.useMutation({
    onSuccess: () => { utils.admin.listPosts.invalidate(); toast.success("Post deleted"); },
    onError: (err) => toast.error(err.message),
  });
  const toggleListing = trpc.admin.toggleListing.useMutation({
    onSuccess: () => { utils.admin.listListings.invalidate(); toast.success("Listing updated"); },
  });
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { utils.admin.listUsers.invalidate(); toast.success("Role updated"); },
  });
  const banUser = trpc.admin.banUser.useMutation({
    onSuccess: (data) => {
      utils.admin.listUsers.invalidate();
      utils.admin.getStats.invalidate();
      toast.success(data.banned ? "User banned" : "User unbanned");
    },
  });

  if (!isAuthenticated || me?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center"><p className="text-destructive font-medium">Access denied. Admin only.</p></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your community</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="posts"><MessageSquare className="h-4 w-4 mr-1" /> Forum</TabsTrigger>
            <TabsTrigger value="listings"><ShoppingBag className="h-4 w-4 mr-1" /> Marketplace</TabsTrigger>
            <TabsTrigger value="donations"><Heart className="h-4 w-4 mr-1" /> Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={stats?.users ?? 0} icon={Users} color="#d4a853" />
              <StatCard label="Admins" value={stats?.admins ?? 0} icon={Shield} color="#ef4444" />
              <StatCard label="Banned" value={stats?.banned ?? 0} icon={Ban} color="#dc2626" />
              <StatCard label="Forum Posts" value={stats?.posts ?? 0} icon={MessageSquare} color="#3b82f6" />
              <StatCard label="Comments" value={stats?.comments ?? 0} icon={MessageSquare} color="#8b5cf6" />
              <StatCard label="Marketplace" value={stats?.listings ?? 0} icon={ShoppingBag} color="#22c55e" />
              <StatCard label="Donations" value={stats?.donations ?? 0} icon={Heart} color="#ec4899" />
              <StatCard label="TOS Accepted" value={stats?.tosAcceptances ?? 0} icon={Check} color="#f59e0b" />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4">Users ({userList?.length ?? 0})</h2>
                <ScrollArea className="h-[60vh]">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-2">ID</th><th className="pb-2">Username</th><th className="pb-2">Role</th><th className="pb-2">Status</th><th className="pb-2">Actions</th></tr></thead>
                    <tbody>
                      {userList?.map((u: any) => (
                        <tr key={u.id} className={`border-b border-border/50 ${u.isBanned ? "opacity-50" : ""}`}>
                          <td className="py-2 text-muted-foreground">{u.id}</td>
                          <td className="py-2 font-medium">{u.username ?? "-"}</td>
                          <td className="py-2"><Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">{u.role}</Badge></td>
                          <td className="py-2">{u.isBanned ? <Badge variant="destructive" className="text-xs">Banned</Badge> : <Badge variant="outline" className="text-xs">Active</Badge>}</td>
                          <td className="py-2 flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/profile/${u.id}`)}>View</Button>
                            {u.role !== "admin" && <Button size="sm" variant="ghost" onClick={() => updateRole.mutate({ userId: u.id, role: "admin" })}><Crown className="h-3 w-3" /></Button>}
                            {u.role === "admin" && u.id !== me?.id && <Button size="sm" variant="ghost" onClick={() => updateRole.mutate({ userId: u.id, role: "user" })}><X className="h-3 w-3" /></Button>}
                            <Button size="sm" variant="ghost" className={u.isBanned ? "text-green-500" : "text-destructive"} onClick={() => banUser.mutate({ userId: u.id, banned: !u.isBanned })}>
                              {u.isBanned ? <Unlock className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4">Forum Posts ({postList?.length ?? 0})</h2>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-3">
                    {postList?.map((p) => (
                      <div key={p.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-sm">{p.title}</h3>
                            <p className="text-xs text-muted-foreground">by {p.authorName ?? "Unknown"} | {p.likes} likes</p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Delete?")) deletePost.mutate({ postId: p.id ?? 0 }); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4">Listings ({listingList?.length ?? 0})</h2>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-3">
                    {listingList?.map((l) => (
                      <div key={l.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-sm">{l.title}</h3>
                            <p className="text-xs text-muted-foreground">by {l.sellerName ?? "Unknown"} | {l.price}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => toggleListing.mutate({ listingId: l.id ?? 0, active: !l.isActive })}>{l.isActive ? <Ban className="h-3 w-3" /> : <Check className="h-3 w-3" />}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4">Donations ({donationList?.length ?? 0})</h2>
                <ScrollArea className="h-[60vh]">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-2">Donor</th><th className="pb-2">Amount</th><th className="pb-2">Status</th></tr></thead>
                    <tbody>
                      {donationList?.map((d: any) => (
                        <tr key={d.id} className="border-b border-border/50">
                          <td className="py-2">{d.donorName ?? "Anonymous"}</td>
                          <td className="py-2 font-medium">{d.amount} {d.currency}</td>
                          <td className="py-2"><Badge variant={d.paymentStatus === "completed" ? "default" : "secondary"} className="text-xs">{d.paymentStatus}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

