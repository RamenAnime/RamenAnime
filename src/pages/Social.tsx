import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Pin,
  Plus,
  Search,
  Clock,
  ChevronDown,
} from "lucide-react";
import TosGate from "@/components/TosGate";

const categories = ["All", "general", "anime", "gaming", "trading", "3dprints", "offtopic"];
const PAGE_SIZE = 10;

function ForumContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("general");
  const [offset, setOffset] = useState(0);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: posts, isLoading } = trpc.social.listPosts.useQuery({
    category: activeCategory === "All" ? undefined : activeCategory,
    limit: PAGE_SIZE,
    offset,
  }, {
    onSuccess: (data) => {
      if (offset === 0) {
        setAllPosts(data);
      } else {
        setAllPosts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    },
  });

  const utils = trpc.useUtils();
  const createPost = trpc.social.createPost.useMutation({
    onSuccess: () => {
      utils.social.listPosts.invalidate();
      setNewPostOpen(false);
      setNewPostTitle("");
      setNewPostContent("");
      setOffset(0);
      setAllPosts([]);
    },
  });

  const likePost = trpc.social.likePost.useMutation({
    onSuccess: () => utils.social.listPosts.invalidate(),
  });

  const loadMore = () => {
    setOffset((prev) => prev + PAGE_SIZE);
  };

  const filteredPosts = allPosts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Social Forum</h1>
            <p className="text-sm text-muted-foreground">Connect with fellow anime fans and collectors</p>
          </div>
          <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c !== "All").map((cat) => (
                      <Badge
                        key={cat}
                        variant={newPostCategory === cat ? "default" : "outline"}
                        className={`cursor-pointer capitalize ${
                          newPostCategory === cat
                            ? "bg-primary text-primary-foreground"
                            : "border-border/50 text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setNewPostCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                  <Input
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
                  <Textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Tell the community more..."
                    rows={5}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!newPostTitle.trim() || !newPostContent.trim() || createPost.isPending}
                  onClick={() =>
                    createPost.mutate({
                      title: newPostTitle,
                      content: newPostContent,
                      category: newPostCategory,
                    })
                  }
                >
                  {createPost.isPending ? "Posting..." : "Publish Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => { setActiveCategory(cat); setOffset(0); setAllPosts([]); }}
                className={
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground capitalize"
                    : "border-border/50 text-muted-foreground hover:text-foreground capitalize whitespace-nowrap"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {isLoading && offset === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-card/50 border-border/50 animate-pulse">
                <CardContent className="p-6 h-32" />
              </Card>
            ))}
          </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Link to={`/profile/${post.authorId}`}>
                      <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                        <AvatarImage src={post.author?.avatar ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {post.author?.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          to={`/profile/${post.authorId}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {post.author?.name ?? "Anonymous"}
                        </Link>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {post.isPinned && (
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground capitalize">
                          {post.category}
                        </Badge>
                      </div>
                      <Link to={`/post/${post.id}`} className="block group">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      </Link>
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() => likePost.mutate({ id: post.id })}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <Link
                          to={`/post/${post.id}`}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Comments
                        </Link>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          {post.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="border-border/50"
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground text-sm">
                Be the first to start a conversation in this category!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Social() {
  return (
    <TosGate>
      <ForumContent />
    </TosGate>
  );
}

