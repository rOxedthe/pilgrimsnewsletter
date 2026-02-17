import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@tiptap/react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { z } from "zod";
import { getFilterError } from "@/lib/wordFilter";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200),
  excerpt: z.string().min(1, "Excerpt is required").max(500),
  category: z.string().min(1, "Category is required").max(100),
  image_url: z.string().url().optional().or(z.literal("")),
  read_time: z.string().max(20).optional().or(z.literal("")),
  meta_title: z.string().max(60).optional().or(z.literal("")),
  meta_description: z.string().max(160).optional().or(z.literal("")),
  meta_keywords: z.string().max(300).optional().or(z.literal("")),
});

export default function AdminArticleEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", category: "", image_url: "", read_time: "",
    published: false, featured: false,
    meta_title: "", meta_description: "", meta_keywords: "",
  });
  const editorInstanceRef = useRef<Editor | null>(null);
  const [articleContent, setArticleContent] = useState("");

  const { data: article, isLoading } = useQuery({
    queryKey: ["admin-article", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase.from("articles").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title, slug: article.slug, excerpt: article.excerpt,
        category: article.category, image_url: article.image_url ?? "",
        read_time: article.read_time ?? "", published: article.published,
        featured: article.featured,
        meta_title: (article as any).meta_title ?? "",
        meta_description: (article as any).meta_description ?? "",
        meta_keywords: (article as any).meta_keywords ?? "",
      });
      setArticleContent(article.content ?? "");
      editorInstanceRef.current?.commands.setContent(article.content ?? "");
    }
  }, [article]);

  const generateSlug = useCallback((title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      articleSchema.parse(form);
      const content = editorInstanceRef.current?.getHTML() ?? articleContent;

      // Word filter check
      const textsToCheck = [form.title, form.excerpt, content];
      for (const text of textsToCheck) {
        const filterError = getFilterError(text);
        if (filterError) throw new Error(filterError);
      }

      // Get author profile id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        category: form.category,
        content,
        published: form.published,
        featured: form.featured,
        image_url: form.image_url || null,
        read_time: form.read_time || null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        meta_keywords: form.meta_keywords || null,
        published_at: form.published ? new Date().toISOString() : null,
        author_id: profile?.id ?? null,
      };

      if (isNew) {
        const { error } = await supabase.from("articles").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").update(payload).eq("id", id!);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: isNew ? "Article created" : "Article saved" });
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-article-stats"] });
      if (isNew) navigate("/admin/articles");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const setField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/articles")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-headline text-2xl font-bold text-foreground">{isNew ? "New Article" : "Edit Article"}</h1>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={form.published} onCheckedChange={(v) => setField("published", v)} />
            <span className="text-sm font-body">{form.published ? "Published" : "Draft"}</span>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
            <Input
              value={form.title}
              onChange={(e) => {
                setField("title", e.target.value);
                if (isNew) setField("slug", generateSlug(e.target.value));
              }}
              placeholder="Article title"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Slug</Label>
            <Input value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="article-slug" />
          </div>

          <RichTextEditor
            content={articleContent}
            onChange={(html) => setArticleContent(html)}
            editorRef={(e) => { editorInstanceRef.current = e; }}
            placeholder="Start writing your article..."
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded border border-border bg-card p-4 space-y-4">
            <h3 className="font-headline text-sm font-semibold text-foreground">Details</h3>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} placeholder="Short description" rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
              <Input value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="e.g. Culture" />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Featured Image URL</Label>
              <Input value={form.image_url} onChange={(e) => setField("image_url", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Read Time</Label>
              <Input value={form.read_time} onChange={(e) => setField("read_time", e.target.value)} placeholder="5 min read" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setField("featured", v)} />
              <span className="text-sm font-body">Featured Article</span>
            </div>
          </div>

          <div className="rounded border border-border bg-card p-4 space-y-4">
            <h3 className="font-headline text-sm font-semibold text-foreground">SEO</h3>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Meta Title <span className="text-muted-foreground">({form.meta_title.length}/60)</span></Label>
              <Input value={form.meta_title} onChange={(e) => setField("meta_title", e.target.value)} maxLength={60} />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Meta Description <span className="text-muted-foreground">({form.meta_description.length}/160)</span></Label>
              <Textarea value={form.meta_description} onChange={(e) => setField("meta_description", e.target.value)} maxLength={160} rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Meta Keywords</Label>
              <Input value={form.meta_keywords} onChange={(e) => setField("meta_keywords", e.target.value)} placeholder="comma, separated, keywords" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
