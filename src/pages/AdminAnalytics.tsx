import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Search,
  MousePointer,
  Users,
  Clock,
  TrendingUp,
  Check,
  X,
  ArrowUpDown,
  Download,
  BarChart3,
  Flame,
  Target,
  PackageOpen,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type SortKey =
  | "username"
  | "email"
  | "pageViews"
  | "searches"
  | "events"
  | "productViews"
  | "lastActive"
  | "hasAcceptedTos";

type SortDir = "asc" | "desc";

function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: { key: SortKey; dir: SortDir };
  onSort: (key: SortKey) => void;
}) {
  const active = currentSort.key === sortKey;
  return (
    <TableHead
      className="cursor-pointer select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`h-3 w-3 ${active ? "text-primary" : "text-muted-foreground/50"}`}
        />
      </div>
    </TableHead>
  );
}

const CHART_COLORS = [
  "#d4a853",
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];

export default function AdminAnalytics() {
  const { user: me, isAuthenticated } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "pageViews",
    dir: "desc",
  });

  const { data: overview, isLoading: overviewLoading } =
    trpc.analytics.getOverview.useQuery(undefined, {
      enabled: isAuthenticated && me?.role === "admin",
    });

  const { data: usersAnalytics, isLoading: usersLoading } =
    trpc.analytics.getUsersAnalytics.useQuery(undefined, {
      enabled: isAuthenticated && me?.role === "admin",
    });

  const { data: userDetail } = trpc.analytics.getUserDetail.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId && isAuthenticated && me?.role === "admin" }
  );

  const { data: trends } = trpc.analytics.getUserTrends.useQuery(undefined, {
    enabled: isAuthenticated && me?.role === "admin",
  });

  const handleSort = (key: SortKey) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc",
    }));
  };

  const sortedUsers = useMemo(() => {
    if (!usersAnalytics) return [];
    const arr = [...usersAnalytics];
    arr.sort((a, b) => {
      const aVal = a[sort.key as keyof typeof a];
      const bVal = b[sort.key as keyof typeof b];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sort.dir === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return sort.dir === "asc"
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }
      const aStr = String(aVal ?? "").toLowerCase();
      const bStr = String(bVal ?? "").toLowerCase();
      return sort.dir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    return arr;
  }, [usersAnalytics, sort]);

  const handleExportUsers = () => {
    if (!usersAnalytics || usersAnalytics.length === 0) return;
    const exportData = usersAnalytics.map((u) => ({
      username: u.username ?? "",
      email: u.email ?? "",
      pageViews: u.pageViews,
      searches: u.searches,
      events: u.events,
      productViews: u.productViews,
      lastActive: u.lastActive ? new Date(u.lastActive).toISOString() : "",
      hasAcceptedTos: u.hasAcceptedTos ? "Yes" : "No",
    }));
    exportToCSV(exportData, "users-analytics.csv");
  };

  if (!isAuthenticated || me?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-destructive font-medium">
            Access denied. Admin only.
          </p>
        </Card>
      </div>
    );
  }

  const hourlyData = overview?.hourlyViews ?? [];
  const topPages = overview?.topPages ?? [];
  const topSearches = overview?.topSearches ?? [];

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time insights and user behavior
            </p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Page Views"
            value={overview?.totalPageViews ?? 0}
            icon={Eye}
            color="#3b82f6"
          />
          <StatCard
            label="Today Page Views"
            value={overview?.todayPageViews ?? 0}
            icon={Eye}
            color="#22c55e"
          />
          <StatCard
            label="Total Searches"
            value={overview?.totalSearches ?? 0}
            icon={Search}
            color="#a855f7"
          />
          <StatCard
            label="Total Events"
            value={overview?.totalEvents ?? 0}
            icon={MousePointer}
            color="#f59e0b"
          />
          <StatCard
            label="Active Sessions (24h)"
            value={overview?.activeSessions ?? 0}
            icon={Clock}
            color="#06b6d4"
          />
          <StatCard
            label="Unique Visitors (24h)"
            value={overview?.uniqueVisitors ?? 0}
            icon={Users}
            color="#ec4899"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Page Views */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Hourly Page Views (Last 24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : hourlyData.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">
                  No hourly data available
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="hour"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#f8fafc",
                        }}
                      />
                      <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Top Pages Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : topPages.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">
                  No page data available
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topPages.slice(0, 10)}
                      layout="vertical"
                      margin={{ left: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        type="number"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="path"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#f8fafc",
                        }}
                      />
                      <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                        {topPages.slice(0, 10).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Searches */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Top Search Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : topSearches.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">
                  No search data available
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSearches.slice(0, 10)}
                      layout="vertical"
                      margin={{ left: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        type="number"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="query"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#f8fafc",
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {topSearches.slice(0, 10).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users Analytics Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Users Analytics
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportUsers}
              disabled={!usersAnalytics || usersAnalytics.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : sortedUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">
                No user analytics data available
              </p>
            ) : (
              <ScrollArea className="h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader
                        label="Username"
                        sortKey="username"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Email"
                        sortKey="email"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Page Views"
                        sortKey="pageViews"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Searches"
                        sortKey="searches"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Events"
                        sortKey="events"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Product Views"
                        sortKey="productViews"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Last Active"
                        sortKey="lastActive"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="TOS"
                        sortKey="hasAcceptedTos"
                        currentSort={sort}
                        onSort={handleSort}
                      />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.map((u) => (
                      <TableRow
                        key={u.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedUserId(u.id)}
                      >
                        <TableCell className="font-medium">
                          {u.username ?? "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.email ?? "-"}
                        </TableCell>
                        <TableCell>{u.pageViews?.toLocaleString() ?? 0}</TableCell>
                        <TableCell>{u.searches?.toLocaleString() ?? 0}</TableCell>
                        <TableCell>{u.events?.toLocaleString() ?? 0}</TableCell>
                        <TableCell>
                          {u.productViews?.toLocaleString() ?? 0}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {u.lastActive
                            ? new Date(u.lastActive).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {u.hasAcceptedTos ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : u.hasAcceptedTos === false ? (
                            <X className="h-4 w-4 text-muted-foreground/50" />
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Trends / Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Categories */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Top Viewed Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!trends?.categoryViews || trends.categoryViews.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No category data
                </p>
              ) : (
                <div className="space-y-3">
                  {trends.categoryViews.map(
                    (cat: { category: string | null; count: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cat.category ?? "Uncategorized"}</span>
                        <Badge variant="secondary">{cat.count} views</Badge>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hot Search Terms */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Hot Search Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!trends?.searchTerms || trends.searchTerms.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No search trend data
                </p>
              ) : (
                <div className="space-y-3">
                  {trends.searchTerms.map(
                    (term: { query: string; count: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{term.query}</span>
                        <Badge variant="secondary">{term.count} searches</Badge>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hot Prospects */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PackageOpen className="h-5 w-5 text-emerald-500" />
                Hot Prospects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!trends?.hotProspects || trends.hotProspects.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No prospect data
                </p>
              ) : (
                <div className="space-y-3">
                  {trends.hotProspects.map(
                    (
                      prospect: {
                        userId: number | null;
                        views: number;
                      },
                      i: number
                    ) => (
                      <div
                        key={i}
                        className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 transition-colors"
                        onClick={() =>
                          prospect.userId && setSelectedUserId(prospect.userId)
                        }
                      >
                        <span className="text-sm font-medium">
                          User #{prospect.userId ?? "Anonymous"}
                        </span>
                        <Badge variant="outline">{prospect.views} views</Badge>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Detail Modal */}
      <Dialog
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Detail
            </DialogTitle>
            <DialogDescription>
              {userDetail?.user?.username ?? (selectedUserId ? `User #${selectedUserId}` : "")}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh]">
            <div className="space-y-6">
              {/* Profile Info */}
              {userDetail?.user && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="font-medium">{userDetail.user.username ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{userDetail.user.email ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="font-medium">{userDetail.user.role ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">TOS Accepted</p>
                    <p className="font-medium">
                      {"hasAcceptedTos" in userDetail.user && userDetail.user.hasAcceptedTos ? (
                        <span className="flex items-center gap-1 text-green-500">
                          <Check className="h-4 w-4" /> Yes
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Page Views */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  Recent Page Views
                </h3>
                {!userDetail?.views || userDetail.views.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No page views</p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Path</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetail.views.slice(0, 50).map(
                          (
                            pv: { path: string; createdAt: Date | string },
                            i: number
                          ) => (
                            <TableRow key={i}>
                              <TableCell className="font-mono text-xs">
                                {pv.path}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(pv.createdAt).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Recent Searches */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-purple-500" />
                  Recent Searches
                </h3>
                {!userDetail?.searches || userDetail.searches.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No searches</p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Term</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetail.searches.slice(0, 25).map(
                          (
                            s: { query: string; createdAt: Date | string },
                            i: number
                          ) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium text-sm">
                                {s.query}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(s.createdAt).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Recent Events */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-amber-500" />
                  Recent Events
                </h3>
                {!userDetail?.events || userDetail.events.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No events</p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetail.events.slice(0, 50).map(
                          (
                            e: {
                              eventType: string;
                              eventData?: string | null;
                              createdAt: Date | string;
                            },
                            i: number
                          ) => (
                            <TableRow key={i}>
                              <TableCell className="text-sm font-medium">
                                {e.eventType}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                {e.eventData ?? "-"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(e.createdAt).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Viewed Products */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <PackageOpen className="h-4 w-4 text-emerald-500" />
                  Viewed Products
                </h3>
                {!userDetail?.products || userDetail.products.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No viewed products
                  </p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Last Viewed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetail.products.map(
                          (
                            p: {
                              id: number;
                              listing?: { title?: string | null } | null;
                              viewCount?: number | null;
                              lastViewedAt?: Date | string | null;
                            },
                            i: number
                          ) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium text-sm">
                                {p.listing?.title ?? `Product #${p.id}`}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {p.viewCount ?? 1}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {p.lastViewedAt
                                  ? new Date(p.lastViewedAt).toLocaleString()
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
