import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminArticles() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, category, published, featured, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-foreground">Articles</h1>
        <Button asChild>
          <Link to="/admin/articles/new"><Plus className="mr-2 h-4 w-4" /> New Article</Link>
        </Button>
      </div>

      <div className="rounded border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {articles?.length === 0 && !isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No articles yet.</TableCell></TableRow>
            )}
            {articles?.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">/{a.slug}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{a.category}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {a.published ? "Published" : "Draft"}
                  </span>
                  {a.featured && <span className="ml-1 rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">Featured</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/articles/${a.id}`}><Edit className="h-4 w-4" /></Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
