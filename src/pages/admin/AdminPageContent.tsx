import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Upload, Image, Type, Link2, Plus, Trash2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentItem {
  id: string;
  page_path: string;
  section_key: string;
  content_value: string;
}

const PAGE_LABELS: Record<string, string> = {
  "/home": "Home Page",
  "/subscribe": "Subscribe Page",
  "/footer": "Footer",
  "/global": "Global / Branding",
};

const FIELD_LABELS: Record<string, { label: string; type: "text" | "textarea" | "image" | "url" }> = {
  book_title: { label: "Book Title", type: "text" },
  book_author: { label: "Book Author", type: "text" },
  book_price: { label: "Book Price", type: "text" },
  book_image: { label: "Book Cover Image", type: "image" },
  book_buy_link: { label: "Book Buy Link", type: "url" },
  page_subtitle: { label: "Page Subtitle", type: "text" },
  page_title: { label: "Page Title", type: "text" },
  page_description: { label: "Page Description", type: "textarea" },
  reader_tier_price: { label: "Reader Tier Price", type: "text" },
  contributor_tier_price: { label: "Contributor Tier Price", type: "text" },
  page_quote: { label: "Quote Text", type: "textarea" },
  page_quote_author: { label: "Quote Author", type: "text" },
  brand_name: { label: "Brand Name", type: "text" },
  brand_description: { label: "Brand Description", type: "textarea" },
  address_line1: { label: "Address Line 1", type: "text" },
  address_line2: { label: "Address Line 2", type: "text" },
  contact_email: { label: "Contact Email", type: "text" },
  shop_url: { label: "Shop Online URL", type: "url" },
  store_url: { label: "Physical Store URL", type: "url" },
  site_name: { label: "Site Name", type: "text" },
  logo_image: { label: "Site Logo", type: "image" },
  nav_link_shop_url: { label: "Navbar Shop Link", type: "url" },
};

function getFieldMeta(key: string) {
  return FIELD_LABELS[key] ?? { label: key.replace(/_/g, " "), type: key.includes("image") || key.includes("logo") ? "image" : key.includes("url") || key.includes("link") ? "url" : "text" };
}

function getIcon(type: string) {
  switch (type) {
    case "image": return <Image className="h-3.5 w-3.5 text-muted-foreground" />;
    case "url": return <Link2 className="h-3.5 w-3.5 text-muted-foreground" />;
    default: return <Type className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

export default function AdminPageContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [newItemPage, setNewItemPage] = useState("");
  const [newItemKey, setNewItemKey] = useState("");
  const [newItemValue, setNewItemValue] = useState("");
  const [showNewItem, setShowNewItem] = useState(false);

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-page-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_content").select("*").order("page_path").order("section_key");
      if (error) throw error;
      return data as ContentItem[];
    },
  });

  const pages = [...new Set(content?.map((c) => c.page_path) ?? [])];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(edits).map(([id, content_value]) =>
        supabase.from("page_content").update({ content_value }).eq("id", id)
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      toast({ title: "Content saved" });
      setEdits({});
      queryClient.invalidateQueries({ queryKey: ["admin-page-content"] });
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("page_content").insert({
        page_path: newItemPage,
        section_key: newItemKey.toLowerCase().replace(/\s+/g, "_"),
        content_value: newItemValue,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Content block added" });
      setNewItemKey("");
      setNewItemValue("");
      setShowNewItem(false);
      queryClient.invalidateQueries({ queryKey: ["admin-page-content"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Content block deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-page-content"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleChange = (id: string, value: string) => {
    setEdits((prev) => ({ ...prev, [id]: value }));
  };

  const getValue = (item: ContentItem) => edits[item.id] ?? item.content_value;

  const handleImageUpload = async (itemId: string, file: File) => {
    setUploading(itemId);
    const ext = file.name.split(".").pop();
    const path = `cms/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, file);
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
    handleChange(itemId, urlData.publicUrl);
    setUploading(null);
    toast({ title: "Image uploaded" });
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-foreground">Site Content</h1>
          <p className="font-body text-sm text-muted-foreground">Edit text, images, and links across all pages.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowNewItem(!showNewItem)}>
            {showNewItem ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
            {showNewItem ? "Cancel" : "Add Block"}
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={Object.keys(edits).length === 0 || saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? "Saving..." : `Save (${Object.keys(edits).length})`}
          </Button>
        </div>
      </div>

      {showNewItem && (
        <div className="rounded border border-dashed border-secondary/50 bg-secondary/5 p-4 space-y-3">
          <h3 className="font-body text-sm font-semibold text-foreground">Add New Content Block</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Page</Label>
              <select
                value={newItemPage}
                onChange={(e) => setNewItemPage(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select page...</option>
                {Object.entries(PAGE_LABELS).map(([path, label]) => (
                  <option key={path} value={path}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Key</Label>
              <Input value={newItemKey} onChange={(e) => setNewItemKey(e.target.value)} placeholder="e.g. hero_banner_image" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input value={newItemValue} onChange={(e) => setNewItemValue(e.target.value)} placeholder="Content or URL" />
            </div>
          </div>
          <Button size="sm" onClick={() => addItemMutation.mutate()} disabled={!newItemPage || !newItemKey || addItemMutation.isPending}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      )}

      {pages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No content blocks configured yet.</p>
      ) : (
        <Tabs defaultValue={pages[0]}>
          <TabsList className="flex-wrap h-auto gap-1">
            {pages.map((p) => (
              <TabsTrigger key={p} value={p}>{PAGE_LABELS[p] || p}</TabsTrigger>
            ))}
          </TabsList>
          {pages.map((page) => (
            <TabsContent key={page} value={page} className="space-y-3 mt-4">
              {content?.filter((c) => c.page_path === page).map((item) => {
                const meta = getFieldMeta(item.section_key);
                return (
                  <div key={item.id} className="rounded border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIcon(meta.type)}
                        <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                          {meta.label}
                        </Label>
                        <span className="text-[10px] text-muted-foreground/50 font-mono">{item.section_key}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteItemMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {meta.type === "image" ? (
                      <div className="space-y-2">
                        {getValue(item) && (
                          <div className="relative w-fit">
                            <img src={getValue(item)} alt={meta.label} className="h-24 w-auto rounded border border-border object-contain" />
                          </div>
                        )}
                        <div className="flex gap-2 items-center">
                          <Input
                            value={getValue(item)}
                            onChange={(e) => handleChange(item.id, e.target.value)}
                            placeholder="Image URL or upload..."
                            className="flex-1"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current[item.id] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(item.id, file);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRefs.current[item.id]?.click()}
                            disabled={uploading === item.id}
                          >
                            <Upload className="mr-1 h-3.5 w-3.5" />
                            {uploading === item.id ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    ) : meta.type === "textarea" ? (
                      <Textarea value={getValue(item)} onChange={(e) => handleChange(item.id, e.target.value)} rows={3} />
                    ) : (
                      <Input value={getValue(item)} onChange={(e) => handleChange(item.id, e.target.value)} />
                    )}
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
