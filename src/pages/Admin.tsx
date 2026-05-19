import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Shield, MessageSquare, ShoppingBag, Heart, BarChart3, Trash2, Crown, X, Check, Ban, Unlock, Eye, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: me, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });
  const { data: userList } = trpc.admin.listUsers.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });
  const { data: postList } = trpc.admin.listPosts.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });
  const { data: listingList } = trpc.admin.listListings.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });
  const { data: donationList } = trpc.admin.listDonations.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });
  const { data: copyrightQueue } = trpc.admin.copyrightQueue.useQuery(undefined, { enabled: isAuthenticated && me?.role === "admin" });

  const utils = trpc.useUtils();
  const deletePost = trpc.admin.deletePost.useMutation({
    onSuccess: () => { utils.admin.listPosts.invalidate(); toast.success(t("admin.postDeleted")); },
    onError: (err) => toast.error(err.message),
  });
  const toggleListing = trpc.admin.toggleListing.useMutation({
    onSuccess: () => { utils.admin.listListings.invalidate(); toast.success(t("admin.listingUpdated")); },
  });
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { utils.admin.listUsers.invalidate(); toast.success(t("admin.roleUpdated")); },
  });
  const reviewCopyright = trpc.admin.reviewCopyright.useMutation({
    onSuccess: () => {
      utils.admin.copyrightQueue.invalidate();
      toast.success(t("admin.copyrightUpdated"));
    },
    onError: (err) => toast.error(err.message),
  });
  const banUser = trpc.admin.banUser.useMutation({
    onSuccess: (data) => {
      utils.admin.listUsers.invalidate();
      utils.admin.getStats.invalidate();
      toast.success(data.banned ? t("admin.userBanned") : t("admin.userUnbanned"));
    },
  });

  if (!isAuthenticated || me?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center"><p className="text-destructive font-medium">{t("admin.accessDenied")}</p></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("admin.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/analytics">{t("admin.analyticsLink")}</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/swarm">{t("admin.swarmLink")}</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/site-doctor">{t("admin.siteDoctorLink")}</Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> {t("admin.overview")}</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> {t("admin.users")}</TabsTrigger>
            <TabsTrigger value="posts"><MessageSquare className="h-4 w-4 mr-1" /> {t("admin.forum")}</TabsTrigger>
            <TabsTrigger value="listings"><ShoppingBag className="h-4 w-4 mr-1" /> {t("admin.marketplaceTab")}</TabsTrigger>
            <TabsTrigger value="donations"><Heart className="h-4 w-4 mr-1" /> {t("admin.donations")}</TabsTrigger>
            <TabsTrigger value="copyright"><Shield className="h-4 w-4 mr-1" /> {t("admin.copyrightTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label={t("admin.totalUsers")} value={stats?.users ?? 0} icon={Users} color="#d4a853" />
              <StatCard label={t("admin.admins")} value={stats?.admins ?? 0} icon={Shield} color="#ef4444" />
              <StatCard label={t("admin.banned")} value={stats?.banned ?? 0} icon={Ban} color="#dc2626" />
              <StatCard label={t("admin.totalPosts")} value={stats?.posts ?? 0} icon={MessageSquare} color="#3b82f6" />
              <StatCard label={t("admin.comments")} value={stats?.comments ?? 0} icon={MessageSquare} color="#8b5cf6" />
              <StatCard label={t("admin.listings")} value={stats?.listings ?? 0} icon={ShoppingBag} color="#22c55e" />
              <StatCard label={t("admin.donations")} value={stats?.donations ?? 0} icon={Heart} color="#ec4899" />
              <StatCard label={t("admin.tosAccepted")} value={stats?.tosAcceptances ?? 0} icon={Check} color="#f59e0b" />
              <StatCard label={t("admin.totalVisits")} value={stats?.visits ?? 0} icon={Eye} color="#06b6d4" />
              <StatCard label={t("admin.orders")} value={stats?.orders ?? 0} icon={ShoppingBag} color="#a855f7" />
              <StatCard label={t("admin.paidOrders")} value={stats?.paidOrders ?? 0} icon={CreditCard} color="#22c55e" />
              <StatCard label={t("admin.activeListings")} value={stats?.activeListings ?? 0} icon={ShoppingBag} color="#10b981" />
              <StatCard label={t("admin.gmv")} value={`$${parseFloat(stats?.gmv ?? "0").toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={CreditCard} color="#d4a853" />
              <StatCard label={t("admin.platformFees")} value={`$${parseFloat(stats?.platformFees ?? "0").toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={CreditCard} color="#f97316" />
              <StatCard label={t("admin.donationRevenue")} value={`$${parseFloat(stats?.donationRevenue ?? "0").toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Heart} color="#ec4899" />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4">{t("admin.usersCount", { count: userList?.length ?? 0 })}</h2>
                <ScrollArea className="h-[60vh]">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-2">{t("common.id")}</th><th className="pb-2">{t("admin.username")}</th><th className="pb-2">{t("admin.role")}</th><th className="pb-2">{t("admin.tosShort")}</th><th className="pb-2">{t("admin.status")}</th><th className="pb-2">{t("admin.actions")}</th></tr></thead>
                    <tbody>
                      {userList?.map((u: any) => (
                        <tr key={u.id} className={`border-b border-border/50 ${u.isBanned ? "opacity-50" : ""}`}>
                          <td className="py-2 text-muted-foreground">{u.id}</td>
                          <td className="py-2 font-medium">{u.username ?? "-"}</td>
                          <td className="py-2"><Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">{u.role}</Badge></td>
                          <td className="py-2">{u.hasAcceptedTos ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-muted-foreground text-xs">-</span>}</td>
                          <td className="py-2">{u.isBanned ? <Badge variant="destructive" className="text-xs">{t("admin.banned")}</Badge> : <Badge variant="outline" className="text-xs">{t("admin.active")}</Badge>}</td>
                          <td className="py-2 flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/profile/${u.id}`)}>{t("admin.view")}</Button>
                            {u.role !== "admin" && <Button size="sm" variant="ghost" aria-label={t("admin.ariaPromoteAdmin")} onClick={() => updateRole.mutate({ userId: u.id, role: "admin" })}><Crown className="h-3 w-3" /></Button>}
                            {u.role === "admin" && u.id !== me?.id && <Button size="sm" variant="ghost" aria-label={t("admin.ariaDemoteAdmin")} onClick={() => updateRole.mutate({ userId: u.id, role: "user" })}><X className="h-3 w-3" /></Button>}
                            <Button size="sm" variant="ghost" className={u.isBanned ? "text-green-500" : "text-destructive"} aria-label={u.isBanned ? t("admin.ariaUnbanUser") : t("admin.ariaBanUser")} onClick={() => banUser.mutate({ userId: u.id, banned: !u.isBanned })}>
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
                <h2 className="text-lg font-bold mb-4">{t("admin.forumPostsCount", { count: postList?.length ?? 0 })}</h2>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-3">
                    {postList?.map((p) => (
                      <div key={p.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-sm">{p.title}</h3>
                            <p className="text-xs text-muted-foreground">{t("admin.byAuthor", { name: p.authorName ?? t("admin.unknown"), likes: String(p.likes ?? 0) })}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-destructive" aria-label={t("admin.ariaDeletePost")} onClick={() => { if (confirm(t("admin.deleteConfirmShort"))) deletePost.mutate({ postId: p.id ?? 0 }); }}><Trash2 className="h-3 w-3" /></Button>
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
                <h2 className="text-lg font-bold mb-4">{t("admin.listingsCount", { count: listingList?.length ?? 0 })}</h2>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-3">
                    {listingList?.map((l) => (
                      <div key={l.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-sm">{l.title}</h3>
                            <p className="text-xs text-muted-foreground">{t("admin.bySeller", { seller: l.sellerName ?? t("admin.unknown"), price: l.price ?? "" })}</p>
                          </div>
                          <Button size="sm" variant="ghost" aria-label={l.isActive ? t("admin.ariaDeactivateListing") : t("admin.ariaActivateListing")} onClick={() => toggleListing.mutate({ listingId: l.id ?? 0, active: !l.isActive })}>{l.isActive ? <Ban className="h-3 w-3" /> : <Check className="h-3 w-3" />}</Button>
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
                <h2 className="text-lg font-bold mb-4">{t("admin.donationsCount", { count: donationList?.length ?? 0 })}</h2>
                <ScrollArea className="h-[60vh]">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-2">{t("admin.donor")}</th><th className="pb-2">{t("admin.amount")}</th><th className="pb-2">{t("admin.paymentMethod")}</th></tr></thead>
                    <tbody>
                      {donationList?.map((d: any) => (
                        <tr key={d.id} className="border-b border-border/50">
                          <td className="py-2">{d.donorName ?? t("admin.anonymous")}</td>
                          <td className="py-2 font-medium">{d.amount} {d.currency}</td>
                          <td className="py-2 text-muted-foreground">{d.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copyright">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-4">{t("admin.copyrightQueue")}</h2>
                <ScrollArea className="h-[60vh]">
                  {copyrightQueue?.map((row: any) => (
                    <div key={row.listing.id} className="border border-border rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <p className="font-medium">{row.listing.title}</p>
                        <p className="text-xs text-muted-foreground">{t("admin.sellerLabel")}: {row.seller?.name || row.seller?.email} · {t("admin.status")}: {row.listing.copyrightStatus}</p>
                      </div>
                      <ul className="text-xs text-muted-foreground mb-3 list-disc pl-4">
                        {row.scans?.slice(0, 3).map((s: any) => (
                          <li key={s.id}>{s.scanType}: {s.reason}</li>
                        ))}
                      </ul>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => reviewCopyright.mutate({ listingId: row.listing.id, status: "clear" })}>{t("admin.approve")}</Button>
                        <Button size="sm" variant="destructive" onClick={() => reviewCopyright.mutate({ listingId: row.listing.id, status: "rejected" })}>{t("admin.reject")}</Button>
                      </div>
                    </div>
                  ))}
                  {!copyrightQueue?.length && <p className="text-muted-foreground text-sm">{t("admin.noFlaggedListings")}</p>}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

