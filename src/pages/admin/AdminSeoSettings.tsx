import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

interface SeoSetting {
  id: string;
  setting_key: string;
  setting_value: string;
}

const LABELS: Record<string, { label: string; hint: string }> = {
  site_title_suffix: { label: "Site Title Suffix", hint: "Appended to every page title (e.g. ' | My Site')" },
  default_og_image: { label: "Default OG Image", hint: "Fallback Open Graph image URL" },
  default_meta_description: { label: "Default Meta Description", hint: "Used when pages don't have their own" },
};

export default function AdminSeoSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-seo-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seo_settings").select("*").order("setting_key");
      if (error) throw error;
      return data as SeoSetting[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(edits).map(([id, setting_value]) =>
        supabase.from("seo_settings").update({ setting_value }).eq("id", id)
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      toast({ title: "SEO settings saved" });
      setEdits({});
      queryClient.invalidateQueries({ queryKey: ["admin-seo-settings"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const getValue = (s: SeoSetting) => edits[s.id] ?? s.setting_value;

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-foreground">SEO Settings</h1>
        <Button onClick={() => saveMutation.mutate()} disabled={Object.keys(edits).length === 0 || saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="space-y-4">
        {settings?.map((s) => {
          const meta = LABELS[s.setting_key] ?? { label: s.setting_key, hint: "" };
          return (
            <div key={s.id} className="rounded border border-border bg-card p-4 space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">{meta.label}</Label>
              {meta.hint && <p className="text-xs text-muted-foreground">{meta.hint}</p>}
              {s.setting_key === "default_meta_description" ? (
                <Textarea value={getValue(s)} onChange={(e) => setEdits((prev) => ({ ...prev, [s.id]: e.target.value }))} rows={3} />
              ) : (
                <Input value={getValue(s)} onChange={(e) => setEdits((prev) => ({ ...prev, [s.id]: e.target.value }))} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
