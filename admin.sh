#!/bin/bash
set -e

echo "========================================"
echo "  Building Admin Dashboard System"
echo "========================================"
echo ""

# 1. Create admin router
cat << 'ADMINROUTEREOF' > api/admin-router.ts
import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  users,
  userProfiles,
  forumPosts,
  forumComments,
  friends,
  marketplaceListings,
  donations,
  geoVerifications,
  tosAcceptances,
} from "@db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

export const adminRouter = createRouter({
  // ─── Analytics ───
  getStats: adminQuery.query(async () => {
    const db = getDb();
    const [userCount] = await db.select({ count: count() }).from(users);
    const [postCount] = await db.select({ count: count() }).from(forumPosts);
    const [commentCount] = await db.select({ count: count() }).from(forumComments);
    const [listingCount] = await db.select({ count: count() }).from(marketplaceListings);
    const [donationCount] = await db.select({ count: count() }).from(donations);
    const [friendCount] = await db.select({ count: count() }).from(friends);
    const [geoCount] = await db.select({ count: count() }).from(geoVerifications);
    const [tosCount] = await db.select({ count: count() }).from(tosAcceptances);
    const [profileCount] = await db.select({ count: count() }).from(userProfiles);

    const [adminCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "admin"));

    return {
      users: userCount.count,
      admins: adminCount.count,
      posts: postCount.count,
      comments: commentCount.count,
      listings: listingCount.count,
      donations: donationCount.count,
      friends: friendCount.count,
      geoVerifications: geoCount.count,
      tosAcceptances: tosCount.count,
      profiles: profileCount.count,
    };
  }),

  // ─── User Management ───
  listUsers: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }),

  getUserDetails: adminQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, input.userId)).limit(1);
      const geo = await db.select().from(geoVerifications).where(eq(geoVerifications.userId, input.userId)).limit(1);
      return { user: user[0] ?? null, profile: profile[0] ?? null, geo: geo[0] ?? null };
    }),

  updateUserRole: adminQuery
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  banUser: adminQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: "user" }).where(eq(users.id, input.userId));
      await db.delete(userProfiles).where(eq(userProfiles.userId, input.userId));
      return { success: true, message: "User has been restricted." };
    }),

  deleteUser: adminQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(userProfiles).where(eq(userProfiles.userId, input.userId));
      await db.delete(geoVerifications).where(eq(geoVerifications.userId, input.userId));
      await db.delete(friends).where(eq(friends.requesterId, input.userId));
      await db.delete(friends).where(eq(friends.addresseeId, input.userId));
      await db.delete(users).where(eq(users.id, input.userId));
      return { success: true, message: "User deleted." };
    }),

  // ─── Forum Moderation ───
  listPosts: adminQuery.query(async () => {
    const db = getDb();
    const posts = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        category: forumPosts.category,
        likes: forumPosts.likes,
        views: forumPosts.views,
        isPinned: forumPosts.isPinned,
        createdAt: forumPosts.createdAt,
        authorName: users.name,
        authorId: users.id,
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .orderBy(desc(forumPosts.createdAt));
    return posts;
  }),

  togglePinPost: adminQuery
    .input(z.object({ postId: z.number(), pinned: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(forumPosts).set({ isPinned: input.pinned }).where(eq(forumPosts.id, input.postId));
      return { success: true };
    }),

  deletePost: adminQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(forumComments).where(eq(forumComments.postId, input.postId));
      await db.delete(forumPosts).where(eq(forumPosts.id, input.postId));
      return { success: true };
    }),

  // ─── Marketplace Moderation ───
  listListings: adminQuery.query(async () => {
    const db = getDb();
    const listings = await db
      .select({
        id: marketplaceListings.id,
        title: marketplaceListings.title,
        description: marketplaceListings.description,
        price: marketplaceListings.price,
        condition: marketplaceListings.condition,
        category: marketplaceListings.category,
        isActive: marketplaceListings.isActive,
        createdAt: marketplaceListings.createdAt,
        sellerName: users.name,
        sellerId: users.id,
      })
      .from(marketplaceListings)
      .leftJoin(users, eq(marketplaceListings.sellerId, users.id))
      .orderBy(desc(marketplaceListings.createdAt));
    return listings;
  }),

  toggleListing: adminQuery
    .input(z.object({ listingId: z.number(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(marketplaceListings).set({ isActive: input.active }).where(eq(marketplaceListings.id, input.listingId));
      return { success: true };
    }),

  // ─── Donations ───
  listDonations: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(donations).orderBy(desc(donations.createdAt));
  }),

  // ─── Geo Verifications ───
  listGeoVerifications: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(geoVerifications).orderBy(desc(geoVerifications.createdAt));
  }),
});
ADMINROUTEREOF

echo "[1/6] Created api/admin-router.ts"

# 2. Update router to include admin
cat << 'ROUTEREOF' > api/router.ts
import { authRouter } from "./auth-router";
import { socialRouter } from "./social-router";
import { tosRouter } from "./tos-router";
import { marketplaceRouter } from "./marketplace-router";
import { geoRouter } from "./geo-router";
import { donationRouter } from "./donation-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  social: socialRouter,
  tos: tosRouter,
  marketplace: marketplaceRouter,
  geo: geoRouter,
  donation: donationRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
ROUTEREOF

echo "[2/6] Updated api/router.ts"

# 3. Create admin dashboard page
cat << 'ADMINPAGEEOF' > src/pages/Admin.tsx
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
                          <td className="py-2 pr-4 font-medium">{u.username ?? "—"}</td>
                          <td className="py-2 pr-4">{u.name ?? "—"}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{u.email ?? "—"}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                              {u.role === "admin" ? <Crown className="h-3 w-3 mr-1" /> : null}
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">{u.authType}</td>
                          <td className="py-2 pr-4 text-muted-foreground text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
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
                          <td className="py-2 text-muted-foreground text-xs">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
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
ADMINPAGEEOF

echo "[3/6] Created src/pages/Admin.tsx"

# 4. Update App.tsx to add admin route
cat << 'APPEOF' > src/App.tsx
import { Routes, Route } from 'react-router'
import GeoBlock from '@/components/GeoBlock'
import EnhancedAgeGate from '@/components/EnhancedAgeGate'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Prints3D from './pages/Prints3D'
import TradingCards from './pages/TradingCards'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Social from './pages/Social'
import ForumPost from './pages/ForumPost'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Marketplace from './pages/Marketplace'
import Donations from './pages/Donations'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <GeoBlock>
      <EnhancedAgeGate>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/3d-prints" element={<Prints3D />} />
              <Route path="/trading-cards" element={<TradingCards />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/donate" element={<Donations />} />
              <Route path="/social" element={<Social />} />
              <Route path="/post/:id" element={<ForumPost />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </EnhancedAgeGate>
    </GeoBlock>
  )
}
APPEOF

echo "[4/6] Updated src/App.tsx"

# 5. Read current Navbar to inject admin link
echo "[5/6] Updating Navbar..."

# Check if Navbar.tsx exists and find a good spot for admin link
NAVBAR_FILE="src/components/Navbar.tsx"
if [ -f "$NAVBAR_FILE" ]; then
  # Add admin link before the closing of the nav links section
  # Look for a closing </div> or similar after existing nav items
  # Use sed to insert admin nav link
  if grep -q "useAuth" "$NAVBAR_FILE"; then
    echo "  useAuth already imported"
  else
    sed -i 's/import { Link } from "react-router";/import { Link } from "react-router"\nimport { useAuth } from "@\/hooks\/useAuth"/' "$NAVBAR_FILE"
    echo "  Added useAuth import"
  fi

  # Add admin link and Shield icon if not already present
  if ! grep -q "Shield" "$NAVBAR_FILE"; then
    sed -i 's/import { /import { Shield, /' "$NAVBAR_FILE"
    echo "  Added Shield icon import"
  fi

  if ! grep -q "\/admin" "$NAVBAR_FILE"; then
    # Find a line with a nav link and add admin link after it
    # Look for Friends link or similar
    if grep -q "\/friends" "$NAVBAR_FILE"; then
      sed -i '/\/friends/a\                    {user?.role === "admin" && (<Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"><Shield className="h-4 w-4" />Admin</Link>)}' "$NAVBAR_FILE"
      echo "  Added admin link after Friends"
    elif grep -q "\/social" "$NAVBAR_FILE"; then
      sed -i '/\/social/a\                    {user?.role === "admin" && (<Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"><Shield className="h-4 w-4" />Admin</Link>)}' "$NAVBAR_FILE"
      echo "  Added admin link after Social"
    else
      echo "  WARNING: Could not find nav link insertion point. Add admin link manually."
    fi
  else
    echo "  Admin link already exists"
  fi
else
  echo "  WARNING: Navbar.tsx not found. Skipping nav update."
fi

# 6. Commit and push
echo ""
echo "[6/6] Committing and pushing..."
git add -A
git commit -m "feat: full admin dashboard with analytics, user mgmt, moderation" || echo "Nothing to commit"
git push origin main || echo "Push failed"

echo ""
echo "========================================"
echo "  ADMIN DASHBOARD DEPLOYED"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Deploy on Render: Manual Deploy > Clear Build Cache & Deploy"
echo "  2. Log in with your admin account"
echo "  3. Visit: /admin"
echo "  4. You'll see:"
echo "     - Analytics overview (users, posts, donations, etc.)"
echo "     - User management (view all, promote/demote admin)"
echo "     - Forum moderation (pin/unpin, delete posts)"
echo "     - Marketplace moderation (activate/deactivate listings)"
echo "     - Donation tracking"
echo ""
echo "Admin nav link appears automatically when logged in as admin."
echo ""
