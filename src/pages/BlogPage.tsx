import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import AuthorAvatar from "@/components/AuthorAvatar";
import { useArticles } from "@/hooks/useArticles";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const categories = ["All", "Culture", "Heritage", "Community", "Literature", "Philosophy", "Science", "Collections"];

export default function BlogPage() {
  const [active, setActive] = useState("All");
  const { data: posts = [], isLoading } = useArticles({ category: active });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="container py-12 lg:py-20">
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-bold text-foreground lg:text-5xl">
              Articles
            </h1>
            <p className="mt-2 font-body text-lg text-muted-foreground">
              Stories, insights, and deep dives from the Himalayan literary world.
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
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded border border-border bg-card p-6 animate-pulse">
                  <div className="h-3 w-16 bg-muted rounded mb-3" />
                  <div className="h-5 w-full bg-muted rounded mb-2" />
                  <div className="h-4 w-3/4 bg-muted rounded mb-4" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const authorName = post.author?.display_name || "Anonymous";
                return (
                  <article
                    key={post.id}
                    className="group rounded border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <span className="inline-block font-body text-xs font-semibold uppercase tracking-widest text-secondary mb-3">
                      {post.category}
                    </span>
                    <h3 className="font-headline text-lg font-bold leading-snug text-foreground mb-2 group-hover:text-secondary transition-colors">
                      <Link to={`/article/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="font-body text-sm leading-relaxed text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                      <AuthorAvatar name={authorName} avatarUrl={post.author?.avatar_url} size="sm" />
                      <span className="font-semibold text-foreground">{authorName}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!isLoading && posts.length === 0 && (
            <p className="py-12 text-center font-body text-muted-foreground">
              No articles in this category yet.
            </p>
          )}
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
