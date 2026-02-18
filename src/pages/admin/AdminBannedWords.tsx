import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ShieldAlert, Search } from "lucide-react";

export default function AdminBannedWords() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newWord, setNewWord] = useState("");
  const [search, setSearch] = useState("");

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["banned-words"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banned_words")
        .select("*")
        .order("word");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (word: string) => {
      const { error } = await supabase
        .from("banned_words")
        .insert({ word: word.toLowerCase().trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewWord("");
      queryClient.invalidateQueries({ queryKey: ["banned-words"] });
      toast({ title: "Word added to filter" });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message?.includes("duplicate")
          ? "This word is already in the list."
          : err.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banned_words").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banned-words"] });
      toast({ title: "Word removed from filter" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filtered = words.filter((w) =>
    w.word.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const trimmed = newWord.trim();
    if (!trimmed) return;
    addMutation.mutate(trimmed);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-destructive" />
        <h1 className="font-headline text-2xl font-bold text-foreground">
          Banned Words
        </h1>
        <span className="ml-auto rounded-full bg-muted px-3 py-1 text-xs font-body text-muted-foreground">
          {words.length} words
        </span>
      </div>

      <p className="font-body text-sm text-muted-foreground">
        Words and phrases in this list are blocked from articles, blog posts, and comments. Matching is case-insensitive with whole-word boundaries.
      </p>

      {/* Add new word */}
      <div className="flex gap-2">
        <Input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Add a word or phrase..."
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="max-w-sm"
        />
        <Button onClick={handleAdd} disabled={!newWord.trim() || addMutation.isPending}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search words..."
          className="pl-9"
        />
      </div>

      {/* Word list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {search ? "No words match your search." : "No banned words yet."}
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded border border-border bg-card px-3 py-2"
            >
              <span className="font-body text-sm text-foreground">{w.word}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => deleteMutation.mutate(w.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
