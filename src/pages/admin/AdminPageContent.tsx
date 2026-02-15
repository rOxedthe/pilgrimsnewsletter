import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentItem {
  id: string;
  page_path: string;
  section_key: string;
  content_value: string;
}

export default function AdminPageContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-page-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_content").select("*").order("page_path");
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
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleChange = (id: string, value: string) => {
    setEdits((prev) => ({ ...prev, [id]: value }));
  };

  const getValue = (item: ContentItem) => edits[item.id] ?? item.content_value;

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-foreground">Site Content</h1>
        <Button onClick={() => saveMutation.mutate()} disabled={Object.keys(edits).length === 0 || saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {pages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No content blocks configured yet.</p>
      ) : (
        <Tabs defaultValue={pages[0]}>
          <TabsList>
            {pages.map((p) => (
              <TabsTrigger key={p} value={p} className="capitalize">{p.replace("/", "")}</TabsTrigger>
            ))}
          </TabsList>
          {pages.map((page) => (
            <TabsContent key={page} value={page} className="space-y-4 mt-4">
              {content?.filter((c) => c.page_path === page).map((item) => (
                <div key={item.id} className="rounded border border-border bg-card p-4 space-y-2">
                  <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                    {item.section_key.replace(/_/g, " ")}
                  </Label>
                  {item.content_value.length > 80 ? (
                    <Textarea value={getValue(item)} onChange={(e) => handleChange(item.id, e.target.value)} rows={3} />
                  ) : (
                    <Input value={getValue(item)} onChange={(e) => handleChange(item.id, e.target.value)} />
                  )}
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
