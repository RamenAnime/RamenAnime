import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Eye,
  Clock,
  Send,
  Pin,
  Lock,
  Unlock,
  Quote,
  Reply,
  Calendar,
  Award,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedLabels } from "@/lib/label-i18n";

const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "🤔", "👏"];

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

function parseBBCode(text: string): string {
  return text
    .replace(/\[b\](.+?)\[\/b\]/g, "<strong>$1</strong>")
    .replace(/\[i\](.+?)\[\/i\]/g, "<em>$1</em>")
    .replace(/\[u\](.+?)\[\/u\]/g, "<u>$1</u>")
    .replace(/\[s\](.+?)\[\/s\]/g, "<s>$1</s>")
    .replace(
      /\[url\](.+?)\[\/url\]/g,
      '<a href="$1" target="_blank" rel="noopener" class="text-primary hover:underline">$1</a>',
    )
    .replace(
      /\[url=(.+?)\](.+?)\[\/url\]/g,
      '<a href="$1" target="_blank" rel="noopener" class="text-primary hover:underline">$2</a>',
    )
    .replace(
      /\[code\](.+?)\[\/code\]/g,
      '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
    )
    .replace(
      /\[spoiler\](.+?)\[\/spoiler\]/g,
      '<span class="spoiler-text bg-muted text-transparent hover:text-foreground cursor-pointer rounded px-1 transition-colors">$1</span>',
    )
    .replace(/\n/g, "<br/>");
}

function RichText({ content }: { content: string }) {
  return (
    <div
      className="text-foreground leading-relaxed prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: parseBBCode(content) }}
    />
  );
}

type TFunction = (key: string, opts?: Record<string, unknown>) => string;

function UserCard({
  user,
  showStats,
  t,
}: {
  user: {
    id: number;
    avatar?: string | null;
    name?: string | null;
    username?: string | null;
    rank?: { name: string; color: string };
    postCount?: number;
    createdAt?: string | Date | null;
  } | null;
  showStats?: boolean;
  t: TFunction;
}) {
  if (!user) return null;
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : t("common.notAvailable");
  return (
    <div className="flex items-center gap-3">
      <Link to={`/profile/${user.id}`}>
        <Avatar className="h-10 w-10 border border-primary/20">
          <AvatarImage src={user.avatar ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {user.name?.charAt(0) ?? user.username?.charAt(0) ?? "U"}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div>
        <Link
          to={`/profile/${user.id}`}
          className="font-medium text-foreground hover:text-primary transition-colors text-sm"
        >
          {user.name ?? user.username ?? t("common.anonymous")}
        </Link>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {user.rank && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1 py-0 ${getRankColor(user.rank.color)}`}
            >
              <Award className="h-2.5 w-2.5 mr-0.5" />
              {user.rank.name}
            </Badge>
          )}
          {showStats && (
            <>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <MessageSquare className="h-2.5 w-2.5" />
                {t("forum.postsCount", { count: user.postCount ?? 0 })}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Calendar className="h-2.5 w-2.5" />
                {t("forum.joined", { date: joinedDate })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PostContent() {
  const { t } = useTranslation();
  const { forumCategoryLabel } = useLocalizedLabels();
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id ?? "0");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: number;
    authorName: string;
    content: string;
  } | null>(null);
  const utils = trpc.useUtils();

  const { data: post, isLoading, isError } = trpc.social.getPost.useQuery(
    { postId },
    { enabled: postId > 0, retry: false },
  );
  const createComment = trpc.social.createComment.useMutation({
    onSuccess: () => {
      utils.social.getPost.invalidate({ postId });
      setCommentContent("");
      setReplyTo(null);
    },
  });
  const likePost = trpc.social.likePost.useMutation({
    onSuccess: () => utils.social.getPost.invalidate({ postId }),
  });
  const likeComment = trpc.social.likeComment.useMutation({
    onSuccess: () => utils.social.getPost.invalidate({ postId }),
  });
  const reactToPost = trpc.social.reactToPost.useMutation({
    onSuccess: () => utils.social.getPost.invalidate({ postId }),
  });
  const togglePin = trpc.social.togglePin.useMutation({
    onSuccess: () => utils.social.getPost.invalidate({ postId }),
  });
  const toggleLock = trpc.social.toggleLock.useMutation({
    onSuccess: () => utils.social.getPost.invalidate({ postId }),
  });

  const handleQuote = (comment: {
    id: number;
    content: string;
    author?: { name?: string | null; username?: string | null };
  }) => {
    const authorName =
      comment.author?.name ??
      comment.author?.username ??
      t("common.user");
    const q =
      comment.content.length > 200
        ? comment.content.substring(0, 200) + "..."
        : comment.content;
    setReplyTo({ id: comment.id, authorName, content: q });
    setCommentContent(`[quote=${authorName}]${q}[/quote]\n`);
  };

  const handleReply = () => {
    if (!commentContent.trim()) return;
    createComment.mutate({
      postId,
      content: commentContent,
      parentId: replyTo?.id,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post || isError) {
    return (
      <div className="min-h-screen py-12">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t("forum.threadNotFound")}
          </h1>
          <p className="text-muted-foreground mb-4">{t("forum.threadDeleted")}</p>
          <Button onClick={() => navigate("/social")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("forum.backToCommunity")}
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen py-6">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/social")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("forum.backToCommunity")}
        </Button>

        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge
              variant="outline"
              className="text-xs capitalize border-border/50 text-muted-foreground"
            >
              {post.category}
            </Badge>
            {post.isPinned && (
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                <Pin className="h-3 w-3 mr-1" />
                {t("common.pinned")}
              </Badge>
            )}
            {post.isLocked && (
              <Badge
                variant="outline"
                className="text-xs border-orange-500/30 text-orange-400"
              >
                <Lock className="h-3 w-3 mr-1" />
                {t("common.locked")}
              </Badge>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{post.title}</h1>
        </div>

        {isAdmin && (
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => togglePin.mutate({ postId })}
            >
              <Pin className="mr-1 h-3.5 w-3.5" />
              {post.isPinned ? t("forum.unpin") : t("forum.pin")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleLock.mutate({ postId })}
            >
              {post.isLocked ? (
                <Unlock className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Lock className="mr-1 h-3.5 w-3.5" />
              )}
              {post.isLocked ? t("forum.unlock") : t("forum.lock")}
            </Button>
          </div>
        )}

        <Card className="border-border/50 mb-4">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <UserCard user={post.author} showStats t={t} />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="pl-0 md:pl-14">
              <RichText content={post.content} />
            </div>
            {post.author?.signature && (
              <div className="pl-0 md:pl-14 mt-4 pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground italic">
                  {post.author.signature}
                </p>
              </div>
            )}
            <div className="pl-0 md:pl-14 mt-4 pt-3 border-t border-border/30 flex items-center gap-4 flex-wrap">
              <button
                onClick={() => likePost.mutate({ id: post.id })}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ThumbsUp className="h-4 w-4" />
                {t("forum.likesCount", { count: post.likes })}
              </button>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {t("forum.viewsCount", { count: post.views })}
              </span>
              <div className="flex items-center gap-1">
                {post.reactionCounts?.map(
                  (r: { emoji: string; count: number }, i: number) => (
                    <button
                      key={i}
                      onClick={() =>
                        isAuthenticated && reactToPost.mutate({ postId, emoji: r.emoji })
                      }
                      className="flex items-center gap-1 text-xs bg-muted hover:bg-muted/80 rounded-full px-2 py-1 transition-colors"
                    >
                      <span>{r.emoji}</span>
                      <span className="text-muted-foreground">{r.count}</span>
                    </button>
                  ),
                )}
              </div>
              {isAuthenticated && (
                <div className="flex items-center gap-0.5">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => reactToPost.mutate({ postId, emoji })}
                      className="text-sm hover:bg-muted rounded-full px-1.5 py-0.5 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t("forum.repliesCount", { count: post.comments?.length ?? 0 })}
          </h3>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map(
              (comment: {
                id: number;
                parentId?: number | null;
                content: string;
                likes: number;
                createdAt: string | Date;
                author?: Parameters<typeof UserCard>[0]["user"];
              }) => (
                <Card
                  key={comment.id}
                  className={`border-border/30 ${
                    comment.parentId ? "ml-6 md:ml-12 border-l-2 border-l-primary/20" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <UserCard user={comment.author ?? null} showStats t={t} />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="pl-0 md:pl-14">
                      {comment.parentId && (
                        <div className="bg-muted/50 border-l-2 border-l-primary/30 rounded-r-md p-2 mb-2 text-sm">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {t("forum.replyingToComment")}
                          </p>
                        </div>
                      )}
                      <RichText content={comment.content} />
                    </div>
                    {comment.author?.signature && (
                      <div className="pl-0 md:pl-14 mt-3 pt-2 border-t border-border/20">
                        <p className="text-xs text-muted-foreground italic">
                          {comment.author.signature}
                        </p>
                      </div>
                    )}
                    <div className="pl-0 md:pl-14 mt-3 flex items-center gap-3">
                      <button
                        onClick={() => likeComment.mutate({ id: comment.id })}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {comment.likes}
                      </button>
                      <button
                        onClick={() => handleQuote(comment)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Quote className="h-3.5 w-3.5" />
                        {t("forum.quote")}
                      </button>
                      <button
                        onClick={() => handleQuote(comment)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Reply className="h-3.5 w-3.5" />
                        {t("forum.reply")}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ),
            )
          ) : (
            <Card className="border-border/30">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("forum.noReplies")}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {!post.isLocked && (
          <Card className="border-border/50 mt-6">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Reply className="h-4 w-4 text-primary" />
                {replyTo
                  ? t("forum.replyingTo", { name: replyTo.authorName })
                  : t("forum.addReply")}
              </h3>
              {replyTo && (
                <div className="bg-muted/50 rounded-md p-2 mb-3 text-sm flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {t("forum.quoting", { name: replyTo.authorName })}
                    </p>
                    <p className="text-muted-foreground line-clamp-2">{replyTo.content}</p>
                  </div>
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setCommentContent("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground ml-2"
                  >
                    {t("forum.clear")}
                  </button>
                </div>
              )}
              <div className="space-y-3">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder={
                    isAuthenticated
                      ? t("forum.replyPlaceholder")
                      : t("forum.loginToReply")
                  }
                  rows={4}
                  disabled={!isAuthenticated}
                  className="w-full rounded-md bg-muted/50 border border-border/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-vertical disabled:opacity-50"
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {t("forum.bbcodeHint")}
                  </div>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={
                      !commentContent.trim() ||
                      createComment.isPending ||
                      !isAuthenticated
                    }
                    onClick={handleReply}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {createComment.isPending
                      ? t("forum.posting")
                      : t("forum.postReply")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {post.isLocked && (
          <Card className="border-orange-500/30 mt-6">
            <CardContent className="p-6 text-center">
              <Lock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("forum.threadLocked")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ForumPost() {
  return <PostContent />;
}
