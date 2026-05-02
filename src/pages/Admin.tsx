import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Shield,
  MessageSquare,
  ShoppingBag,
  Heart,
  Globe,
  FileCheck,
  UserCheck,
  BarChart3,
  Trash2,
  Ban,
  Pin,
  Eye,
  X,
  Check,
  Crown,
} from "lucide-react";
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

  const pinPost = trpc.admin.togglePinPost.useMutation({
    onSuccess: () => { utils.admin.listPosts.invalidate(); toast.success("Post updated"); },
  });

  const toggleListing = trpc.admin.toggleListing.useMutation({
    onSuccess: () => { utils.admin.listListings.invalidate(); toast.success("Listing updated"); },
  });

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { utils.admin.listUsers.invalidate(); toast.success("Role updated"); },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center"><p className="text-muted-foreground">Please log in to access the admin panel.</p></Card>
      </div>
    );
  }

  if (me?.role !== "admin") {
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
            <p className="text-sm text-muted-foreground">Manage your ラーメンアニメ community</p>
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

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Users" value={stats?.users ?? 0} icon={Users} color="#d4a853" />
              <StatCard label="Admins" value={stats?.admins ?? 0} icon={Shield} color="#ef4444" />
              <StatCard label="Forum Posts" value={stats?.posts ?? 0} icon={MessageSquare} color="#3b82f6" />
              <StatCard label="Comments" value={stats?.comments ?? 0} icon={MessageSquare} color="#8b5cf6" />
              <StatCard label="Marketplace" value={stats?.listings ?? 0} icon={ShoppingBag} color="#22c55e" />
              <StatCard label="Donations" value={stats?.donations ?? 0} icon={Heart} color="#ec4899" />
              <StatCard label="Profiles" value={stats?.profiles ?? 0} icon={UserCheck} color="#06b6d4" />
              <StatCard label="TOS Accepted" value={stats?.tosAcceptances ?? 0} icon={FileCheck} color="#f59e0b" />
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="h-5 w-5" /> Registered Users ({userList?.length ?? 0})</h2>
                <ScrollArea className="h-[60vh]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-2 pr-4">ID</th>
                        <th className="pb-2 pr-4">Username</th>
                        <th className="pb-2 pr-4">Name</th>
                        <th className="pb-2 pr-4">Email</th>
                        <th className="pb-2 pr-4">Role</th>
                        <th className="pb-2 pr-4">Auth</th>
                        <th className="pb-2 pr-4">Joined</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userList?.map((u) => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 pr-4 text-muted-foreground">{u.id}</td>
                          <td className="py-2 pr-4 font-medium">{u.username ?? "-"}</td>
                          <td className="py-2 pr-4">{u.name ?? "-"}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{u.email ?? "-"}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                              {u.role === "admin" ? <Crown className="h-3 w-3 mr-1" /> : null}
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">{u.authType}</td>
                          <td className="py-2 pr-4 text-muted-foreground text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                          <td className="py-2 flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/profile/${u.id}`)}><Eye className="h-3 w-3" /></Button>
                            {u.role !== "admin" && (
                              <Button size="sm" variant="ghost" onClick={() => updateRole.mutate({ userId: u.id, role: "admin" })}><Crown className="h-3 w-3" /></Button>
                            )}
                            {u.role === "admin" && u.id !== me?.id && (
                              <Button size="sm" variant="ghost" onClick={() => updateRole.mutate({ userId: u.id, role: "user" })}><X className="h-3 w-3" /></Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* POSTS TAB */}
          <TabsContent value="posts">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Forum Posts ({postList?.length ?? 0})</h2>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-3">
                    {postList?.map((p) => (
                      <div key={p.id} className="border border-border rounded-lg p-4 hover:bg-muted/20">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-sm">{p.title}</h3>
                              {p.isPinned && <Badge variant="outline" className="text-xs border-primary text-primary"><Pin className="h-3 w-3 mr-1" />Pinned</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">by {p.authorName ?? "Unknown"} | {p.category} | {p.likes} likes | {p.views} views</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{p.content}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => pinPost.mutate({ postId: p.id ?? 0, pinned: !p.isPinned })}>
                              {p.isPinned ? <X className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Delete this post?")) deletePost.mutate({ postId: p.id ?? 0 }); }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LISTINGS TAB */}
          <TabsContent value="listings">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Marketplace Listings ({listingList?.length ?? 0})</h2>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-3">
                    {listingList?.map((l) => (
                      <div key={l.id} className="border border-border rounded-lg p-4 hover:bg-muted/20">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-sm">{l.title}</h3>
                              <Badge variant={l.isActive ? "default" : "secondary"} className="text-xs">{l.isActive ? "Active" : "Inactive"}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">by {l.sellerName ?? "Unknown"} | {l.condition} | {l.price}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => toggleListing.mutate({ listingId: l.id ?? 0, active: !l.isActive })}>
                            {l.isActive ? <Ban className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DONATIONS TAB */}
          <TabsContent value="donations">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Heart className="h-5 w-5" /> Donations ({donationList?.length ?? 0})</h2>
                <ScrollArea className="h-[60vh]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-2 pr-4">ID</th>
                        <th className="pb-2 pr-4">Donor</th>
                        <th className="pb-2 pr-4">Amount</th>
                        <th className="pb-2 pr-4">Method</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationList?.map((d) => (
                        <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 pr-4 text-muted-foreground">{d.id}</td>
                          <td className="py-2 pr-4">{d.donorName ?? "Anonymous"}</td>
                          <td className="py-2 pr-4 font-medium">{d.amount} {d.currency}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{d.paymentMethod}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={d.paymentStatus === "completed" ? "default" : "secondary"} className="text-xs">{d.paymentStatus}</Badge>
                          </td>
                          <td className="py-2 text-muted-foreground text-xs">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-"}</td>
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
