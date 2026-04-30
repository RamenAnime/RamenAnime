import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { useState } from "react";
import TosGate from "@/components/TosGate";

function PostContent() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id ?? "0");
  const navigate = useNavigate();
  const [commentContent, setCommentContent] = useState("");

  const { data: post, isLoading } = trpc.social.getPost.useQuery(
    { id: postId },
    { enabled: postId > 0 }
  );

  const utils = trpc.useUtils();
  const createComment = trpc.social.createComment.useMutation({
    onSuccess: () => {
      utils.social.getPost.invalidate({ id: postId });
      setCommentContent("");
    },
  });

  const likePost = trpc.social.likePost.useMutation({
    onSuccess: () => utils.social.getPost.invalidate({ id: postId }),
  });

  const likeComment = trpc.social.likeComment.useMutation({
    onSuccess: () => utils.social.getPost.invalidate({ id: postId }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen py-12">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
          <Button onClick={() => navigate("/social")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container px-4 md:px-6 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/social")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forum
        </Button>

        {/* Post */}
        <Card className="bg-card/50 border-border/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Link to={`/profile/${post.authorId}`}>
                <Avatar className="h-12 w-12 border border-primary/20 shrink-0">
                  <AvatarImage src={post.author?.avatar ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {post.author?.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
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
                <h1 className="text-xl font-bold text-foreground mb-3">{post.title}</h1>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                  <button
                    onClick={() => likePost.mutate({ id: post.id })}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {post.likes} Likes
                  </button>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {post.comments?.length ?? 0} Comments
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {post.views} Views
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comment Form */}
        <Card className="bg-card/50 border-border/50 mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Add a Comment</h3>
            <div className="space-y-3">
              <Textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="bg-muted/50 border-border/50"
              />
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!commentContent.trim() || createComment.isPending}
                onClick={() =>
                  createComment.mutate({ postId: post.id, content: commentContent })
                }
              >
                <Send className="mr-2 h-4 w-4" />
                {createComment.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Comments ({post.comments?.length ?? 0})
          </h3>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <Card key={comment.id} className="bg-card/30 border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Link to={`/profile/${comment.authorId}`}>
                      <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                        <AvatarImage src={comment.author?.avatar ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {comment.author?.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/profile/${comment.authorId}`}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {comment.author?.name ?? "Anonymous"}
                        </Link>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                      <button
                        onClick={() => likeComment.mutate({ id: comment.id })}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {comment.likes}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-card/30 border-border/30">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForumPost() {
  return (
    <TosGate>
      <PostContent />
    </TosGate>
  );
}
