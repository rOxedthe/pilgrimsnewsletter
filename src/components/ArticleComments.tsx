import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AuthorAvatar from "@/components/AuthorAvatar";
import { MessageSquare, Trash2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { getFilterError } from "@/lib/wordFilter";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export default function ArticleComments({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["article-comments", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_comments")
        .select("*")
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Fetch profiles for comment authors
      const userIds = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

      return data.map((c: any) => ({
        ...c,
        profile: profileMap.get(c.user_id) ?? null,
      })) as Comment[];
    },
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      const trimmed = newComment.trim();
      if (!trimmed || !user) return;
      const filterError = await getFilterError(trimmed);
      if (filterError) throw new Error(filterError);
      const { error } = await supabase.from("article_comments").insert({
        article_id: articleId,
        user_id: user.id,
        content: trimmed,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["article-comments", articleId] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("article_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-comments", articleId] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-headline text-xl font-bold text-foreground">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Post comment */}
      {user ? (
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{newComment.length}/1000</span>
            <Button
              size="sm"
              onClick={() => postMutation.mutate()}
              disabled={!newComment.trim() || postMutation.isPending}
            >
              <Send className="mr-1 h-3.5 w-3.5" />
              {postMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded border border-border bg-muted/30 p-4 text-center">
          <p className="font-body text-sm text-muted-foreground">
            <Link to="/auth" className="font-semibold text-secondary hover:underline">Sign in</Link> to leave a comment.
          </p>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-2 rounded border border-border p-4">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const name = comment.profile?.display_name || "Anonymous";
            const isOwner = user?.id === comment.user_id;
            return (
              <div key={comment.id} className="rounded border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AuthorAvatar name={name} avatarUrl={comment.profile?.avatar_url} size="sm" />
                    <span className="font-body text-sm font-semibold text-foreground">{name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(comment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <p className="font-body text-sm leading-relaxed text-foreground/90">{comment.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
