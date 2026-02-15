import { useEffect, useState, useRef, useCallback } from "react";
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
import { ArrowLeft, Save, Upload, X, ImagePlus } from "lucide-react";

export default function AdminBlogEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", category: "General",
    cover_image: "", published: false, featured: false,
    meta_title: "", meta_description: "",
    gallery_images: [] as string[],
  });
  const editorRef = useRef<Editor | null>(null);
  const [blogContent, setBlogContent] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-blog-post", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title, slug: post.slug, excerpt: post.excerpt,
        category: post.category, cover_image: post.cover_image ?? "",
        published: post.published, featured: post.featured,
        meta_title: post.meta_title ?? "", meta_description: post.meta_description ?? "",
        gallery_images: (post.gallery_images as string[]) ?? [],
      });
      setBlogContent(post.content ?? "");
      editorRef.current?.commands.setContent(post.content ?? "");
    }
  }, [post]);

  const generateSlug = useCallback((title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setField("cover_image", url);
    setUploading(false);
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setForm((prev) => ({ ...prev, gallery_images: [...prev.gallery_images, ...urls] }));
    setUploading(false);
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const content = editorRef.current?.getHTML() ?? blogContent;

      const { data: profile } = await supabase
        .from("profiles").select("id").eq("user_id", user!.id).single();

      const payload = {
        title: form.title, slug: form.slug, excerpt: form.excerpt,
        category: form.category, content, published: form.published,
        featured: form.featured, cover_image: form.cover_image || null,
        gallery_images: form.gallery_images,
        meta_title: form.meta_title || null, meta_description: form.meta_description || null,
        published_at: form.published ? new Date().toISOString() : null,
        author_id: profile?.id ?? null,
      };

      if (isNew) {
        const { error } = await supabase.from("blog_posts").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", id!);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: isNew ? "Blog post created" : "Blog post saved" });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      if (isNew) navigate("/admin/blog");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const setField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blog")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-headline text-2xl font-bold text-foreground">{isNew ? "New Blog Post" : "Edit Blog Post"}</h1>
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
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
            <Input
              value={form.title}
              onChange={(e) => { setField("title", e.target.value); if (isNew) setField("slug", generateSlug(e.target.value)); }}
              placeholder="Blog post title"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Slug</Label>
            <Input value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="blog-post-slug" />
          </div>

          <RichTextEditor
            content={blogContent}
            onChange={(html) => setBlogContent(html)}
            editorRef={(e) => { editorRef.current = e; }}
            placeholder="Write your blog post with images..."
          />
        </div>

        <div className="space-y-6">
          {/* Cover Image */}
          <div className="rounded border border-border bg-card p-4 space-y-3">
            <h3 className="font-headline text-sm font-semibold text-foreground">Cover Image</h3>
            {form.cover_image && (
              <div className="relative">
                <img src={form.cover_image} alt="Cover" className="w-full rounded object-cover" />
                <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80" onClick={() => setField("cover_image", "")}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ""; }} />
            <Button variant="outline" size="sm" className="w-full" onClick={() => coverInputRef.current?.click()} disabled={uploading}>
              <Upload className="mr-1 h-3.5 w-3.5" /> {uploading ? "Uploading..." : "Upload Cover"}
            </Button>
            <Input value={form.cover_image} onChange={(e) => setField("cover_image", e.target.value)} placeholder="Or paste image URL..." className="text-xs" />
          </div>

          {/* Gallery */}
          <div className="rounded border border-border bg-card p-4 space-y-3">
            <h3 className="font-headline text-sm font-semibold text-foreground">Gallery Images</h3>
            {form.gallery_images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {form.gallery_images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-20 rounded object-cover" />
                    <Button variant="ghost" size="sm" className="absolute top-0.5 right-0.5 h-5 w-5 p-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeGalleryImage(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleGalleryUpload(e.target.files); e.target.value = ""; }} />
            <Button variant="outline" size="sm" className="w-full" onClick={() => galleryInputRef.current?.click()} disabled={uploading}>
              <ImagePlus className="mr-1 h-3.5 w-3.5" /> Add Gallery Images
            </Button>
          </div>

          {/* Details */}
          <div className="rounded border border-border bg-card p-4 space-y-4">
            <h3 className="font-headline text-sm font-semibold text-foreground">Details</h3>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} placeholder="Short description" rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
              <Input value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="e.g. Travel" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setField("featured", v)} />
              <span className="text-sm font-body">Featured Post</span>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded border border-border bg-card p-4 space-y-4">
            <h3 className="font-headline text-sm font-semibold text-foreground">SEO</h3>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Meta Title ({form.meta_title.length}/60)</Label>
              <Input value={form.meta_title} onChange={(e) => setField("meta_title", e.target.value)} maxLength={60} />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Meta Description ({form.meta_description.length}/160)</Label>
              <Textarea value={form.meta_description} onChange={(e) => setField("meta_description", e.target.value)} maxLength={160} rows={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
