import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, RefreshCw, Download, Globe, Type } from "lucide-react";

interface PageSeo {
  id: string;
  page_path: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  canonical_url: string;
  no_index: boolean;
  updated_at: string;
}

interface ContentItem {
  id: string;
  page_path: string;
  section_key: string;
  content_value: string;
}

const LANDING_FIELDS = [
  { key: "hero_title_line1", label: "Hero Title Line 1", type: "text" },
  { key: "hero_title_line2", label: "Hero Title Line 2 (Accent)", type: "text" },
  { key: "hero_description", label: "Hero Description", type: "textarea" },
  { key: "hero_cta_primary_text", label: "Primary CTA Text", type: "text" },
  { key: "hero_cta_primary_link", label: "Primary CTA Link", type: "text" },
  { key: "hero_cta_secondary_text", label: "Secondary CTA Text", type: "text" },
  { key: "hero_cta_secondary_link", label: "Secondary CTA Link", type: "text" },
];

export default function AdminSeoSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [edits, setEdits] = useState<Record<string, Partial<PageSeo>>>({});
  const [contentEdits, setContentEdits] = useState<Record<string, string>>({});
  const [newPath, setNewPath] = useState("");
  const [sitemapXml, setSitemapXml] = useState<string | null>(null);
  const [generatingSitemap, setGeneratingSitemap] = useState(false);

  const { data: pages, isLoading: loadingSeo } = useQuery({
    queryKey: ["admin-page-seo"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_seo").select("*").order("page_path");
      if (error) throw error;
      return data as PageSeo[];
    },
  });

  const { data: landingContent, isLoading: loadingContent } = useQuery({
    queryKey: ["admin-landing-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_path", "/home")
        .in("section_key", LANDING_FIELDS.map((f) => f.key));
      if (error) throw error;
      return data as ContentItem[];
    },
  });

  const isLoading = loadingSeo || loadingContent;

  const getVal = (page: PageSeo, field: keyof PageSeo) =>
    (edits[page.id]?.[field] as string) ?? (page[field] as string);

  const handleEdit = (id: string, field: keyof PageSeo, value: string | boolean) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(edits).map(([id, fields]) =>
        supabase.from("page_seo").update(fields).eq("id", id)
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      toast({ title: "SEO settings saved" });
      setEdits({});
      setContentEdits({});
      queryClient.invalidateQueries({ queryKey: ["admin-page-seo"] });
      queryClient.invalidateQueries({ queryKey: ["admin-landing-content"] });
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const saveContentMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(contentEdits).map(([id, content_value]) =>
        supabase.from("page_content").update({ content_value }).eq("id", id)
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      toast({ title: "Landing page content saved" });
      setContentEdits({});
      queryClient.invalidateQueries({ queryKey: ["admin-landing-content"] });
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const path = newPath.startsWith("/") ? newPath : `/${newPath}`;
      const { error } = await supabase.from("page_seo").insert({ page_path: path });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Page added" });
      setNewPath("");
      queryClient.invalidateQueries({ queryKey: ["admin-page-seo"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_seo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Page removed" });
      queryClient.invalidateQueries({ queryKey: ["admin-page-seo"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const generateSitemap = async () => {
    setGeneratingSitemap(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sitemap", {
        body: { siteUrl: window.location.origin },
      });
      if (error) throw error;
      setSitemapXml(data.sitemap);
      toast({ title: `Sitemap generated with ${data.urlCount} URLs` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingSitemap(false);
    }
  };

  const downloadSitemap = () => {
    if (!sitemapXml) return;
    const blob = new Blob([sitemapXml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const editCount = Object.keys(edits).length;
  const contentEditCount = Object.keys(contentEdits).length;
  const totalEdits = editCount + contentEditCount;

  const getContentVal = (key: string) => {
    const item = landingContent?.find((c) => c.section_key === key);
    if (!item) return "";
    return contentEdits[item.id] ?? item.content_value;
  };

  const handleContentEdit = (key: string, value: string) => {
    const item = landingContent?.find((c) => c.section_key === key);
    if (item) setContentEdits((prev) => ({ ...prev, [item.id]: value }));
  };

  const handleSaveAll = async () => {
    if (editCount > 0) saveMutation.mutate();
    if (contentEditCount > 0) saveContentMutation.mutate();
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-foreground">SEO & Sitemap</h1>
          <p className="font-body text-sm text-muted-foreground">Manage per-page meta tags, OG images, and generate your sitemap.</p>
        </div>
        <Button onClick={handleSaveAll} disabled={totalEdits === 0 || saveMutation.isPending || saveContentMutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending || saveContentMutation.isPending ? "Saving..." : `Save (${totalEdits})`}
        </Button>
      </div>

      {/* Landing Page Content */}
      <div className="rounded border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-headline text-lg font-semibold text-foreground">Landing Page Content</h2>
        </div>
        <p className="text-xs text-muted-foreground">Edit the hero section text, description, and call-to-action buttons.</p>
        <div className="space-y-3">
          {LANDING_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  value={getContentVal(field.key)}
                  onChange={(e) => handleContentEdit(field.key, e.target.value)}
                  rows={2}
                  placeholder={field.label}
                />
              ) : (
                <Input
                  value={getContentVal(field.key)}
                  onChange={(e) => handleContentEdit(field.key, e.target.value)}
                  placeholder={field.label}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sitemap Section */}
      <div className="rounded border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-headline text-lg font-semibold text-foreground">Sitemap Generator</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateSitemap} disabled={generatingSitemap}>
              <RefreshCw className={`mr-1 h-4 w-4 ${generatingSitemap ? "animate-spin" : ""}`} />
              {generatingSitemap ? "Generating..." : "Generate"}
            </Button>
            {sitemapXml && (
              <Button variant="outline" size="sm" onClick={downloadSitemap}>
                <Download className="mr-1 h-4 w-4" /> Download XML
              </Button>
            )}
          </div>
        </div>
        {sitemapXml && (
          <pre className="max-h-60 overflow-auto rounded bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
            {sitemapXml}
          </pre>
        )}
      </div>

      {/* Add Page */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">Add Page Path</Label>
          <Input value={newPath} onChange={(e) => setNewPath(e.target.value)} placeholder="/about" />
        </div>
        <Button size="sm" onClick={() => addMutation.mutate()} disabled={!newPath || addMutation.isPending}>
          <Plus className="mr-1 h-4 w-4" /> Add Page
        </Button>
      </div>

      {/* Per-Page SEO */}
      <div className="space-y-4">
        {pages?.map((page) => (
          <div key={page.id} className="rounded border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-base font-semibold text-foreground">{page.page_path}</h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(page.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Meta Title</Label>
                <Input value={getVal(page, "meta_title")} onChange={(e) => handleEdit(page.id, "meta_title", e.target.value)} placeholder="Page Title | Site Name" />
                <p className="text-[10px] text-muted-foreground">{(getVal(page, "meta_title") || "").length}/60 chars</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Canonical URL</Label>
                <Input value={getVal(page, "canonical_url")} onChange={(e) => handleEdit(page.id, "canonical_url", e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Meta Description</Label>
              <Textarea value={getVal(page, "meta_description")} onChange={(e) => handleEdit(page.id, "meta_description", e.target.value)} rows={2} placeholder="Brief description for search results..." />
              <p className="text-[10px] text-muted-foreground">{(getVal(page, "meta_description") || "").length}/160 chars</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">OG Image URL</Label>
                <Input value={getVal(page, "og_image")} onChange={(e) => handleEdit(page.id, "og_image", e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Switch
                  checked={edits[page.id]?.no_index ?? page.no_index}
                  onCheckedChange={(v) => handleEdit(page.id, "no_index", v)}
                />
                <Label className="text-xs text-muted-foreground">No Index (hide from search engines)</Label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
