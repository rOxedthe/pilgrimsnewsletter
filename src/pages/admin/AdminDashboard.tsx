import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FileText, Globe, Settings, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: articleStats } = useQuery({
    queryKey: ["admin-article-stats"],
    queryFn: async () => {
      const { count: total } = await supabase.from("articles").select("*", { count: "exact", head: true });
      const { count: published } = await supabase.from("articles").select("*", { count: "exact", head: true }).eq("published", true);
      const { count: drafts } = await supabase.from("articles").select("*", { count: "exact", head: true }).eq("published", false);
      return { total: total ?? 0, published: published ?? 0, drafts: drafts ?? 0 };
    },
  });

  const { data: recentArticles } = useQuery({
    queryKey: ["admin-recent-articles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, published, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-foreground">Dashboard</h1>
        <Button asChild>
          <Link to="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" /> New Article
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Total Articles</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-headline font-bold">{articleStats?.total ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Published</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-headline font-bold text-secondary">{articleStats?.published ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Drafts</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-headline font-bold text-muted-foreground">{articleStats?.drafts ?? 0}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Recent Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentArticles?.length === 0 && <p className="text-sm text-muted-foreground">No articles yet.</p>}
          {recentArticles?.map((article) => (
            <Link
              key={article.id}
              to={`/admin/articles/${article.id}`}
              className="flex items-center justify-between rounded border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="font-body text-sm font-medium text-foreground">{article.title}</p>
                <p className="font-body text-xs text-muted-foreground">{new Date(article.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${article.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {article.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/articles" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <FileText className="h-5 w-5 text-secondary" />
              <span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Manage Articles</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/content" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <Globe className="h-5 w-5 text-secondary" />
              <span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Site Content</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/seo" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <Settings className="h-5 w-5 text-secondary" />
              <span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">SEO Settings</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
