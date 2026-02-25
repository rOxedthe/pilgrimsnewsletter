import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Save, GripVertical, Eye, EyeOff, Star } from "lucide-react";

interface LandingPost {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
  image_url: string | null;
  link_url: string | null;
  author_name: string | null;
  display_order: number;
  is_featured: boolean;
  published: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  category: "",
  image_url: "",
  link_url: "",
  author_name: "Anonymous",
  display_order: 0,
  is_featured: false,
  published: true,
};

type FormData = typeof EMPTY_FORM;

export default function AdminLandingPosts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-landing-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_posts")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as LandingPost[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        display_order: Number(data.display_order),
        excerpt: data.excerpt || null,
        image_url: data.image_url || null,
        link_url: data.link_url || null,
      };

      if (editingId) {
        const { error } = await supabase.from("landing_posts").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("landing_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editingId ? "Post updated" : "Post created" });
      queryClient.invalidateQueries({ queryKey: ["admin-landing-posts"] });
      queryClient.invalidateQueries({ queryKey: ["landing-posts"] });
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("landing_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Post deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-landing-posts"] });
      queryClient.invalidateQueries({ queryKey: ["landing-posts"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("landing_posts").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-landing-posts"] });
      queryClient.invalidateQueries({ queryKey: ["landing-posts"] });
    },
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (post: LandingPost) => {
    setForm({
      title: post.title,
      excerpt: post.excerpt || "",
      category: post.category,
      image_url: post.image_url || "",
      link_url: post.link_url || "",
      author_name: post.author_name || "Anonymous",
      display_order: post.display_order,
      is_featured: post.is_featured,
      published: post.published,
    });
    setEditingId(post.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNew = () => {
    resetForm();
    const maxOrder = posts.length > 0 ? Math.max(...posts.map((p) => p.display_order)) + 1 : 1;
    setForm({ ...EMPTY_FORM, display_order: maxOrder });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-foreground">Landing Page Posts</h1>
          <p className="font-body text-sm text-muted-foreground">
            Manage the posts shown in the "More to Explore" section on the home page.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <Card className="border-2 border-secondary/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-headline text-lg">
                {editingId ? "Edit Post" : "New Post"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Title */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Post title..."
                />
              </div>

              {/* Excerpt */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder="Short description shown under the title..."
                  rows={2}
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Category *</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Culture, Heritage, Science..."
                />
              </div>

              {/* Author */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Author Name</Label>
                <Input
                  value={form.author_name}
                  onChange={(e) => setForm((p) => ({ ...p, author_name: e.target.value }))}
                  placeholder="Anonymous"
                />
              </div>

              {/* Image URL */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Image URL</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://..."
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="h-24 w-auto rounded border border-border object-cover mt-1"
                  />
                )}
              </div>

              {/* Link URL */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Link URL</Label>
                <Input
                  value={form.link_url}
                  onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))}
                  placeholder="/article/my-slug or https://..."
                />
              </div>

              {/* Display Order */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Display Order</Label>
                <Input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm((p) => ({ ...p, display_order: Number(e.target.value) }))}
                  placeholder="1"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="font-body text-sm text-foreground">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="font-body text-sm text-foreground">Featured</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={!form.title || !form.category || saveMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : editingId ? "Update Post" : "Create Post"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-body text-sm text-muted-foreground">No landing posts yet.</p>
            <Button className="mt-4" onClick={handleNew}>
              <Plus className="mr-2 h-4 w-4" /> Create your first post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className={`transition-opacity ${!post.published ? "opacity-60" : ""}`}
            >
              <CardContent className="flex items-center gap-4 p-4">
                {/* Order handle */}
                <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="font-mono text-xs">{post.display_order}</span>
                </div>

                {/* Thumbnail */}
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="h-14 w-20 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-14 w-20 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No img</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-body text-xs font-bold uppercase tracking-widest text-editorial">
                      {post.category}
                    </span>
                    {post.is_featured && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="font-headline text-sm font-bold text-foreground truncate">{post.title}</p>
                  <p className="font-body text-xs text-muted-foreground truncate">{post.excerpt}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title={post.published ? "Unpublish" : "Publish"}
                    onClick={() =>
                      togglePublishedMutation.mutate({ id: post.id, published: !post.published })
                    }
                  >
                    {post.published ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete "${post.title}"?`)) deleteMutation.mutate(post.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
