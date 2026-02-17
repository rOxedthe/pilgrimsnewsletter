import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trash2, Search, MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  article_id: string;
  article: { title: string; slug: string } | null;
  profile: { display_name: string | null; username: string | null } | null;
}

export default function AdminComments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_comments")
        .select("id, content, created_at, user_id, article_id, article:articles!article_comments_article_id_fkey(title, slug)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set((data || []).map((c: any) => c.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds)
        : { data: [] };
      
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      
      return (data || []).map((c: any) => ({
        ...c,
        profile: profileMap.get(c.user_id) || null,
      })) as Comment[];
      
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("article_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Comment deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = comments.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.content.toLowerCase().includes(term) ||
      c.article?.title?.toLowerCase().includes(term) ||
      c.profile?.display_name?.toLowerCase().includes(term) ||
      c.profile?.username?.toLowerCase().includes(term)
    );
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-foreground">Comments</h1>
          <p className="font-body text-sm text-muted-foreground">
            {comments.length} total comment{comments.length !== 1 ? "s" : ""} across all articles.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by content, article, or user..."
          className="pl-10"
        />
      </div>

      <div className="rounded border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comment</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                  {search ? "No comments match your filter." : "No comments yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-xs">
                    <p className="font-body text-sm text-foreground line-clamp-2">{comment.content}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {comment.article?.title || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {comment.profile?.display_name || comment.profile?.username || "Anonymous"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
