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

          <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wider transition-colors ${
                  active === cat
                    ? "border-b-2 border-editorial text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-5 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="py-12 text-center font-body text-muted-foreground">No blog posts in this category yet.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group"
                >
                  {/* Tall thumbnail card like the reference */}
                  <div className="overflow-hidden rounded-lg shadow-sm transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex aspect-[3/4] items-center justify-center bg-muted">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Date + title below the image */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-body text-xs text-editorial">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <h3 className="font-body text-sm font-medium leading-snug text-foreground group-hover:text-editorial transition-colors">
                      {post.title}
                    </h3>
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
