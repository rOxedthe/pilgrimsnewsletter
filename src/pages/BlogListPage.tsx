import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Calendar, ImageIcon } from "lucide-react";

const categories = ["All", "General", "Travel", "Photography", "Stories", "Culture"];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  category: string;
  published_at: string | null;
  created_at: string;
}

export default function BlogListPage() {
  const [active, setActive] = useState("All");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["public-blog-posts", active],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image, category, published_at, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (active !== "All") {
        query = query.eq("category", active);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="container py-12 lg:py-20">
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-bold text-foreground lg:text-5xl">Blog</h1>
            <p className="mt-2 font-body text-lg text-muted-foreground">
              Photo stories, visual essays, and behind-the-scenes glimpses.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wider transition-colors ${
                  active === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded border border-border bg-card overflow-hidden">
                  <div className="h-48 bg-muted" />
                  <div className="p-5 space-y-2">
                    <div className="h-3 w-16 bg-muted rounded" />
                    <div className="h-5 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="py-12 text-center font-body text-muted-foreground">No blog posts in this category yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group rounded border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  {post.cover_image ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-muted/50">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <span className="inline-block font-body text-xs font-semibold uppercase tracking-widest text-secondary">
                      {post.category}
                    </span>
                    <h3 className="font-headline text-lg font-bold leading-snug text-foreground group-hover:text-secondary transition-colors">
                      {post.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
