import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthorAvatar from "@/components/AuthorAvatar";
import { useArticles } from "@/hooks/useArticles";
import featuredImg from "@/assets/featured-article.jpg";

const categories = ["All", "Culture", "Heritage", "Community", "Literature"];

export default function BlogSection() {
  const [active, setActive] = useState("All");
  const { data: posts = [], isLoading } = useArticles({
    category: active,
    limit: 6,
  });

  return (
    <section className="border-t border-border py-12 lg:py-20">
      <div className="container">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="font-headline text-2xl font-bold text-foreground">
            More to Explore
          </h2>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 font-body text-sm font-semibold text-editorial hover:underline"
          >
            All Articles <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Category filter tabs */}
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
                <div className="aspect-[16/9] bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-5 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="py-12 text-center font-body text-muted-foreground">No articles in this category yet.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const authorName = post.author?.display_name || "Anonymous";
              return (
                <article key={post.id} className="group border-b border-border pb-6">
                  <Link to={`/article/${post.slug}`} className="block overflow-hidden rounded">
                    <img
                      src={post.image_url || featuredImg}
                      alt={post.title}
                      className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </Link>
                  <div className="mt-4 space-y-2">
                    <span className="font-body text-xs font-bold uppercase tracking-widest text-editorial">
                      {post.category}
                    </span>
                    <h3 className="font-headline text-lg font-bold leading-snug text-foreground">
                      <Link to={`/article/${post.slug}`} className="hover:underline decoration-1 underline-offset-4">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="font-body text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                      <AuthorAvatar name={authorName} avatarUrl={post.author?.avatar_url} size="sm" />
                      <span>{authorName}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
