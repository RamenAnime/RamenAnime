import { useTranslation } from "react-i18next";

import { trpc } from "@/providers/trpc";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {

  Users, Activity, TrendingUp, Search, AlertTriangle,

  Zap, Radio, Brain, Eye, BarChart3, RefreshCw

} from "lucide-react";

import {

  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,

  PieChart, Pie, Cell

} from "recharts";



const COLORS = ["#fbbf24", "#38bdf8", "#34d399", "#a78bfa", "#f87171", "#fb923c"];



export default function SwarmDashboard() {

  const { t } = useTranslation();

  const utils = trpc.useUtils();



  const { data: snapshot, isLoading } = trpc.swarm.snapshot.useQuery(undefined, {

    refetchInterval: 3000,

    refetchIntervalInBackground: true,

  });



  const { data: collective } = trpc.swarm.collectiveInterests.useQuery(undefined, {

    refetchInterval: 5000,

  });



  const { data: anomalies } = trpc.swarm.detectAnomalies.useQuery(undefined, {

    refetchInterval: 10000,

  });



  const { data: history } = trpc.swarm.swarmHistory.useQuery(undefined, {

    refetchInterval: 30000,

  });



  const handleRefresh = () => {

    void utils.swarm.snapshot.invalidate();

    void utils.swarm.collectiveInterests.invalidate();

    void utils.swarm.detectAnomalies.invalidate();

    void utils.swarm.swarmHistory.invalidate();

  };



  if (isLoading && !snapshot) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />

      </div>

    );

  }



  const topListingsData = (snapshot?.topListings || []).map(([id, count]) => ({

    name: t("swarm.itemLabel", { id }),

    value: count,

  }));



  const topSearchesData = (snapshot?.topSearches || []).map(([query, count]) => ({

    name: query.length > 15 ? query.slice(0, 15) + "..." : query,

    fullQuery: query,

    value: count,

  }));



  const categoryData = (snapshot?.topCategories || []).map(([cat, count]) => ({

    name: cat,

    value: count,

  }));



  return (

    <div className="min-h-screen py-8">

      <div className="container px-4 max-w-7xl mx-auto">



        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">

              <Brain className="h-6 w-6 text-primary" />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-foreground">{t("swarm.title")}</h1>

              <p className="text-sm text-muted-foreground">

                {t("swarm.subtitle", { count: snapshot?.activeUsers || 0 })}

              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <Badge variant="outline" className="flex items-center gap-1">

              <Radio className="h-3 w-3 text-green-500 animate-pulse" />

              {t("swarm.live")}

            </Badge>

            <Button size="sm" variant="outline" onClick={handleRefresh}>

              <RefreshCw className="h-4 w-4" />

            </Button>

          </div>

        </div>



        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <StatCard

            icon={<Users className="h-5 w-5 text-primary" />}

            label={t("swarm.activeNodes")}

            value={snapshot?.activeUsers || 0}

          />

          <StatCard

            icon={<Zap className="h-5 w-5 text-yellow-500" />}

            label={t("swarm.sharedInsights")}

            value={snapshot?.totalSharedInsights || 0}

          />

          <StatCard

            icon={<Eye className="h-5 w-5 text-blue-500" />}

            label={t("swarm.views1h")}

            value={history?.totalViews || 0}

          />

          <StatCard

            icon={<Search className="h-5 w-5 text-purple-500" />}

            label={t("swarm.searches1h")}

            value={history?.totalSearches || 0}

          />

        </div>



        <Tabs defaultValue="live" className="space-y-6">

          <TabsList className="grid w-full grid-cols-4 md:w-auto">

            <TabsTrigger value="live">{t("swarm.tabLive")}</TabsTrigger>

            <TabsTrigger value="trends">{t("swarm.tabTrending")}</TabsTrigger>

            <TabsTrigger value="anomalies">{t("swarm.tabAnomalies")}</TabsTrigger>

            <TabsTrigger value="collective">{t("swarm.tabCollective")}</TabsTrigger>

          </TabsList>



          <TabsContent value="live" className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Card>

                <CardHeader>

                  <CardTitle className="text-sm flex items-center gap-2">

                    <Activity className="h-4 w-4" />

                    {t("swarm.hotListings")}

                  </CardTitle>

                </CardHeader>

                <CardContent>

                  {topListingsData.length === 0 ? (

                    <p className="text-sm text-muted-foreground text-center py-4">{t("swarm.noActiveViewers")}</p>

                  ) : (

                    <div className="space-y-2">

                      {topListingsData.map((item, i) => (

                        <div key={i} className="flex items-center justify-between">

                          <span className="text-sm">{item.name}</span>

                          <div className="flex items-center gap-2">

                            <Progress value={Math.min(100, (item.value / (topListingsData[0]?.value || 1)) * 100)} className="w-24 h-2" />

                            <Badge variant="secondary" className="text-xs">{t("swarm.viewing", { count: item.value })}</Badge>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </CardContent>

              </Card>



              <Card>

                <CardHeader>

                  <CardTitle className="text-sm flex items-center gap-2">

                    <Search className="h-4 w-4" />

                    {t("swarm.trendingSearches")}

                  </CardTitle>

                </CardHeader>

                <CardContent>

                  {topSearchesData.length === 0 ? (

                    <p className="text-sm text-muted-foreground text-center py-4">{t("swarm.noActiveSearches")}</p>

                  ) : (

                    <div className="h-64">

                      <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={topSearchesData.slice(0, 6)} layout="vertical">

                          <XAxis type="number" hide />

                          <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />

                          <Tooltip />

                          <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]} />

                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                  )}

                </CardContent>

              </Card>

            </div>

          </TabsContent>



          <TabsContent value="trends" className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Card>

                <CardHeader>

                  <CardTitle className="text-sm flex items-center gap-2">

                    <TrendingUp className="h-4 w-4" />

                    {t("swarm.categoryActivity")}

                  </CardTitle>

                </CardHeader>

                <CardContent>

                  {categoryData.length === 0 ? (

                    <p className="text-sm text-muted-foreground text-center py-4">{t("swarm.noCategoryData")}</p>

                  ) : (

                    <div className="h-64">

                      <ResponsiveContainer width="100%" height="100%">

                        <PieChart>

                          <Pie

                            data={categoryData}

                            cx="50%"

                            cy="50%"

                            innerRadius={40}

                            outerRadius={80}

                            paddingAngle={5}

                            dataKey="value"

                          >

                            {categoryData.map((_, i) => (

                              <Cell key={i} fill={COLORS[i % COLORS.length]} />

                            ))}

                          </Pie>

                          <Tooltip />

                        </PieChart>

                      </ResponsiveContainer>

                      <div className="flex flex-wrap gap-2 justify-center mt-2">

                        {categoryData.map((cat, i) => (

                          <div key={i} className="flex items-center gap-1 text-xs">

                            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />

                            {cat.name} ({cat.value})

                          </div>

                        ))}

                      </div>

                    </div>

                  )}

                </CardContent>

              </Card>



              <Card>

                <CardHeader>

                  <CardTitle className="text-sm flex items-center gap-2">

                    <BarChart3 className="h-4 w-4" />

                    {t("swarm.topPages1h")}

                  </CardTitle>

                </CardHeader>

                <CardContent>

                  {!history?.topPages?.length ? (

                    <p className="text-sm text-muted-foreground text-center py-4">{t("swarm.noCategoryData")}</p>

                  ) : (

                    <div className="space-y-2">

                      {history.topPages.slice(0, 10).map((page: { path: string; views: number }, i: number) => (

                        <div key={i} className="flex items-center justify-between text-sm">

                          <span className="truncate max-w-[200px]">{page.path}</span>

                          <Badge variant="outline" className="text-xs">{t("swarm.viewsBadge", { count: page.views })}</Badge>

                        </div>

                      ))}

                    </div>

                  )}

                </CardContent>

              </Card>

            </div>

          </TabsContent>



          <TabsContent value="anomalies" className="space-y-4">

            <Card>

              <CardHeader>

                <CardTitle className="text-sm flex items-center gap-2">

                  <AlertTriangle className="h-4 w-4 text-destructive" />

                  {t("swarm.swarmAnomalies")}

                </CardTitle>

              </CardHeader>

              <CardContent>

                {(!anomalies?.anomalies || anomalies.anomalies.length === 0) ? (

                  <div className="text-center py-8">

                    <p className="text-green-500 font-medium">{t("swarm.allNormal")}</p>

                    <p className="text-sm text-muted-foreground">{t("swarm.noAnomalies")}</p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {anomalies.anomalies.map((a: {

                      type: string;

                      severity: string;

                      pattern?: string;

                      affectedUsers?: number;

                      query?: string;

                      searcherCount?: number;

                    }, i: number) => (

                      <div key={i} className={`p-3 rounded-lg border ${

                        a.severity === "critical" ? "bg-red-500/10 border-red-500/20" :

                        a.severity === "warning" ? "bg-yellow-500/10 border-yellow-500/20" :

                        "bg-blue-500/10 border-blue-500/20"

                      }`}>

                        <div className="flex items-center justify-between mb-1">

                          <span className="font-medium text-sm">

                            {a.type === "error_spike" ? t("swarm.errorSpike") : t("swarm.searchSpike")}

                          </span>

                          <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "default" : "secondary"} className="text-xs">

                            {a.severity}

                          </Badge>

                        </div>

                        <p className="text-sm text-muted-foreground">

                          {a.type === "error_spike"

                            ? t("swarm.errorSpikeDetail", { pattern: a.pattern ?? "", count: a.affectedUsers ?? 0 })

                            : t("swarm.searchSpikeDetail", { query: a.query ?? "", count: a.searcherCount ?? 0 })

                          }

                        </p>

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>



          <TabsContent value="collective" className="space-y-4">

            <Card>

              <CardHeader>

                <CardTitle className="text-sm flex items-center gap-2">

                  <Brain className="h-4 w-4" />

                  {t("swarm.collectiveInterests")}

                </CardTitle>

              </CardHeader>

              <CardContent>

                {!collective?.interests?.length ? (

                  <p className="text-sm text-muted-foreground text-center py-4">

                    {t("swarm.needMoreUsers")}

                  </p>

                ) : (

                  <div className="space-y-4">

                    <div>

                      <p className="text-sm text-muted-foreground mb-2">{t("swarm.swarmConfidence")}</p>

                      <Progress

                        value={(collective.confidence || 0) * 100}

                        className="h-2"

                      />

                      <p className="text-xs text-muted-foreground mt-1">

                        {t("swarm.liveSignals", { count: collective.activeEmbeddings || 0 })}

                      </p>

                    </div>

                    <div className="space-y-2">

                      <p className="text-sm font-medium">{t("swarm.swarmWants")}</p>

                      {collective.interests.map(([interest, count], i) => (

                        <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">

                          <span className="text-sm">{interest}</span>

                          <Badge className="text-xs">{t("swarm.interested", { count })}</Badge>

                        </div>

                      ))}

                    </div>

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

    </div>

  );

}



function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {

  return (

    <Card>

      <CardContent className="p-4">

        <div className="flex items-center justify-between mb-2">

          {icon}

          <span className="text-2xl font-bold">{value.toLocaleString()}</span>

        </div>

        <p className="text-sm font-medium">{label}</p>

      </CardContent>

    </Card>

  );

}


