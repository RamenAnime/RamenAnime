import { useState, useEffect } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useSubforums } from "@/i18n/useSubforums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, ThumbsUp, Eye, Pin, Plus, Search, Clock, ChevronDown, TrendingUp, Users, Lock, FolderOpen, Award, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "🤔", "👏"];
const PAGE_SIZE = 15;

function getRankColor(color: string) {
  const map: Record<string, string> = {
    gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return map[color] || map.gray;
}

function ForumContent() {
  const { t } = useTranslation();
  const subforums = useSubforums();
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("general");
  const [offset, setOffset] = useState(0);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<"latest" | "popular" | "pinned">("latest");

  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: _postsData, isLoading } = trpc.social.listPosts.useQuery({
    category: activeCategory, limit: PAGE_SIZE, offset, sort,
  });

  useEffect(() => {
    if (_postsData) {
      if (offset === 0) setAllPosts(_postsData);
      else setAllPosts((prev) => [...prev, ..._postsData]);
      setHasMore(_postsData.length === PAGE_SIZE);
    }
  }, [_postsData, offset]);

  const { data: subforumStats } = trpc.social.getSubforumStats.useQuery();
  const { data: recentActivity } = trpc.social.getRecentActivity.useQuery({ limit: 8 });
  const { data: leaderboard } = trpc.social.getLeaderboard.useQuery({ period: "month", limit: 5 });

  const createPost = trpc.social.createPost.useMutation({
    onSuccess: () => { utils.social.listPosts.invalidate(); utils.social.getSubforumStats.invalidate(); utils.social.getRecentActivity.invalidate(); setNewPostOpen(false); setNewPostTitle(""); setNewPostContent(""); setOffset(0); setAllPosts([]); },
  });

  const reactToPost = trpc.social.reactToPost.useMutation({ onSuccess: () => utils.social.listPosts.invalidate() });

  const loadMorePosts = () => setOffset((prev) => prev + PAGE_SIZE);

  const filteredPosts = allPosts.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCategoryClick = (catId: string) => { setActiveCategory(activeCategory === catId ? undefined : catId); setOffset(0); setAllPosts([]); };

  return (
    <div className="min-h-screen py-6">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("forum.community")}</h1>
                <p className="text-sm text-muted-foreground">{t("forum.communitySubtitle")}</p>
              </div>
              <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
                <DialogTrigger asChild><Button className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"><Plus className="mr-2 h-4 w-4" />{t("forum.newThread")}</Button></DialogTrigger>
                <DialogContent className="bg-card border-border max-w-lg"><DialogHeader><DialogTitle>{t("forum.createThread")}</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div><label className="text-sm font-medium text-foreground mb-1 block">{t("forum.subforum")}</label><div className="flex flex-wrap gap-2">{subforums.map((sub) => (<Badge key={sub.id} variant={newPostCategory === sub.id ? "default" : "outline"} className={`cursor-pointer ${newPostCategory === sub.id ? "bg-primary text-primary-foreground" : "border-border/50 text-muted-foreground hover:text-foreground"}`} onClick={() => setNewPostCategory(sub.id)}>{sub.name}</Badge>))}</div></div>
                    <div><label className="text-sm font-medium text-foreground mb-1 block">{t("forum.threadTitle")}</label><Input value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder={t("forum.titlePlaceholder")} className="bg-muted/50 border-border/50" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-1 block">{t("forum.threadContent")}</label><textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder={t("forum.contentPlaceholder")} rows={5} className="w-full rounded-md bg-muted/50 border border-border/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-vertical" /></div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={!newPostTitle.trim() || !newPostContent.trim() || createPost.isPending} onClick={() => createPost.mutate({ title: newPostTitle, content: newPostContent, category: newPostCategory })}>{createPost.isPending ? t("forum.posting") : t("forum.publishThread")}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t("forum.searchThreads")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50 border-border/50" /></div>
              <Tabs value={sort} onValueChange={(v) => { setSort(v as "latest" | "popular" | "pinned"); setOffset(0); setAllPosts([]); }}>
                <TabsList className="bg-muted">
                  <TabsTrigger value="latest">{t("forum.sortLatest")}</TabsTrigger>
                  <TabsTrigger value="popular">{t("forum.sortPopular")}</TabsTrigger>
                  <TabsTrigger value="pinned">{t("forum.sortPinned")}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {!activeCategory && !searchQuery && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {subforums.map((sub) => { const stats = subforumStats?.find((s) => s.category === sub.id); return (
                  <Card key={sub.id} className="border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer group" onClick={() => handleCategoryClick(sub.id)}>
                    <CardContent className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"><FolderOpen className="h-5 w-5 text-primary" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{sub.name}</h3><ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" /></div><p className="text-xs text-muted-foreground mt-0.5">{sub.desc}</p><div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{t("forum.threadsCount", { count: stats?.postCount ?? 0 })}</span>{stats?.latestPost && (<span className="flex items-center gap-1 truncate"><Clock className="h-3 w-3 shrink-0" /><span className="truncate">{stats.latestPost.title}</span></span>)}</div></div></div></CardContent>
                  </Card>
                ); })}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={!activeCategory ? "default" : "outline"} className={`cursor-pointer ${!activeCategory ? "bg-primary text-primary-foreground" : "border-border/50 text-muted-foreground hover:text-foreground"}`} onClick={() => handleCategoryClick("")}>{t("forum.allSubforums")}</Badge>
              {subforums.map((sub) => (<Badge key={sub.id} variant={activeCategory === sub.id ? "default" : "outline"} className={`cursor-pointer ${activeCategory === sub.id ? "bg-primary text-primary-foreground" : "border-border/50 text-muted-foreground hover:text-foreground"}`} onClick={() => handleCategoryClick(sub.id)}>{sub.name}</Badge>))}
            </div>

            {isLoading && offset === 0 ? (<div className="space-y-3">{[...Array(3)].map((_, i) => (<Card key={i} className="bg-card/50 border-border/50 animate-pulse"><CardContent className="p-6 h-24" /></Card>))}</div>) : filteredPosts && filteredPosts.length > 0 ? (<div className="space-y-3">
              {filteredPosts.map((post) => (
                <Card key={post.id} className={`border-border/50 hover:border-primary/30 transition-all duration-200 ${post.isPinned ? "border-l-2 border-l-primary" : ""}`}><CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Link to={`/profile/${post.authorId}`}><Avatar className="h-10 w-10 border border-primary/20 shrink-0"><AvatarImage src={post.author?.avatar ?? undefined} /><AvatarFallback className="bg-primary/10 text-primary text-xs">{post.author?.name?.charAt(0) ?? "U"}</AvatarFallback></Avatar></Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1"><Link to={`/profile/${post.authorId}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{post.author?.name ?? post.author?.username ?? t("common.anonymous")}</Link>{post.author?.rank && (<Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getRankColor(post.author.rank.color)}`}>{post.author.rank.name}</Badge>)}<span className="text-xs text-muted-foreground">·</span><span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(post.createdAt).toLocaleDateString()}</span>{post.isPinned && (<Badge variant="outline" className="text-xs border-primary/30 text-primary"><Pin className="h-3 w-3 mr-1" />{t("common.pinned")}</Badge>)}{post.isLocked && (<Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400"><Lock className="h-3 w-3 mr-1" />{t("common.locked")}</Badge>)}<Badge variant="outline" className="text-xs border-border/50 text-muted-foreground capitalize">{post.category}</Badge></div>
                      <Link to={`/post/${post.id}`} className="block group"><h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-0.5 line-clamp-1">{post.title}</h3><p className="text-sm text-muted-foreground line-clamp-1">{post.content}</p></Link>
                      <div className="flex items-center gap-4 mt-2"><span className="flex items-center gap-1 text-xs text-muted-foreground"><ThumbsUp className="h-3.5 w-3.5" />{post.likes}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" />{post.commentCount ?? 0}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3.5 w-3.5" />{post.views}</span>{post.reactionCounts && post.reactionCounts.length > 0 && (<div className="flex items-center gap-1">{post.reactionCounts.map((r: { emoji: string; count: number }, i: number) => (<span key={i} className="text-xs bg-muted rounded-full px-1.5 py-0.5">{r.emoji} {r.count}</span>))}</div>)}{isAuthenticated && (<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{REACTION_EMOJIS.map((emoji) => (<button key={emoji} onClick={() => reactToPost.mutate({ postId: post.id, emoji })} className="text-xs hover:bg-muted rounded px-1 py-0.5 transition-colors">{emoji}</button>))}</div>)}</div>
                    </div>
                  </div>
                </CardContent></Card>
              ))}
              {hasMore && (<div className="flex justify-center pt-4"><Button variant="outline" onClick={loadMorePosts} disabled={isLoading} className="border-border/50"><ChevronDown className="mr-2 h-4 w-4" />{isLoading ? t("common.loading") : t("forum.loadMore")}</Button></div>)}
            </div>) : (<Card className="bg-card/50 border-border/50"><CardContent className="p-12 text-center"><MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium text-foreground mb-2">{t("forum.noThreads")}</h3><p className="text-muted-foreground text-sm">{t("forum.beFirstConversation")}</p></CardContent></Card>)}
          </div>

          <div className="w-full lg:w-72 shrink-0 space-y-4">
            <Card className="border-border/50"><CardContent className="p-4"><h3 className="font-semibold text-foreground flex items-center gap-2 mb-3"><Award className="h-4 w-4 text-primary" />{t("forum.topContributors")}</h3><div className="space-y-2">{leaderboard?.map((entry: { authorId: number; author?: { avatar?: string; name?: string; rank?: { name: string; color: string } }; count: number }, i: number) => (<div key={i} className="flex items-center gap-2 text-sm"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-gray-400/20 text-gray-400" : i === 2 ? "bg-orange-600/20 text-orange-500" : "bg-muted text-muted-foreground"}`}>{i + 1}</span><Avatar className="h-6 w-6"><AvatarImage src={entry.author?.avatar} /><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{entry.author?.name?.charAt(0) ?? "U"}</AvatarFallback></Avatar><Link to={`/profile/${entry.authorId}`} className="flex-1 truncate hover:text-primary transition-colors">{entry.author?.name ?? t("common.user")}</Link>{entry.author?.rank && (<Badge variant="outline" className={`text-[10px] px-1 ${getRankColor(entry.author.rank.color)}`}>{entry.author.rank.name}</Badge>)}<span className="text-xs text-muted-foreground">{entry.count}</span></div>)) || (<p className="text-sm text-muted-foreground text-center py-4">{t("forum.noDataYet")}</p>)}</div></CardContent></Card>
            <Card className="border-border/50"><CardContent className="p-4"><h3 className="font-semibold text-foreground flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-primary" />{t("forum.recentActivity")}</h3><div className="space-y-2">{recentActivity?.map((post: { id: number; title: string; createdAt: string; author?: { avatar?: string; name?: string } }) => (<Link key={post.id} to={`/post/${post.id}`} className="flex items-start gap-2 text-sm hover:bg-muted/50 rounded-lg p-1.5 -mx-1.5 transition-colors group"><Avatar className="h-6 w-6 shrink-0"><AvatarImage src={post.author?.avatar} /><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{post.author?.name?.charAt(0) ?? "U"}</AvatarFallback></Avatar><div className="min-w-0"><p className="text-foreground font-medium truncate group-hover:text-primary transition-colors">{post.title}</p><p className="text-xs text-muted-foreground">{t("forum.byAuthor", { name: post.author?.name ?? t("common.user") })} · {new Date(post.createdAt).toLocaleDateString()}</p></div></Link>)) || (<p className="text-sm text-muted-foreground text-center py-4">{t("forum.noRecentActivity")}</p>)}</div></CardContent></Card>
            <Card className="border-border/50"><CardContent className="p-4"><h3 className="font-semibold text-foreground flex items-center gap-2 mb-3"><Users className="h-4 w-4 text-primary" />{t("forum.forumStats")}</h3><div className="space-y-1.5 text-sm">{subforumStats?.map((s) => (<div key={s.category} className="flex justify-between text-muted-foreground"><span className="capitalize">{s.category}</span><span>{t("forum.threadsCount", { count: s.postCount })}</span></div>))}</div></CardContent></Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForumContent;