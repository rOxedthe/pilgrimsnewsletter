import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLandingPosts } from "@/hooks/useLandingPosts";
import featuredImg from "@/assets/featured-article.jpg";

export default function FeaturedArticles() {
  const { data: posts = [], isLoading } = useLandingPosts({ limit: 6 });

  if (isLoading) {
    return (
      <section className="container py-12 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[16/9] bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-5 bg-muted rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="container py-12 lg:py-20">
      <div className="mb-8 flex items-end justify-between">
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

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const href = post.link_url || "#";
          const isExternal = href.startsWith("http");

          return (
            <article key={post.id} className="group">
              {isExternal ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded">
                  <img
                    src={post.image_url || featuredImg}
                    alt={post.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </a>
              ) : (
                <Link to={href} className="block overflow-hidden rounded">
                  <img
                    src={post.image_url || featuredImg}
                    alt={post.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </Link>
              )}
              <div className="mt-3 space-y-1.5">
                <span className="font-body text-xs font-bold uppercase tracking-widest text-editorial">
                  {post.category}
                </span>
                <h3 className="font-headline text-base font-bold leading-snug text-foreground">
                  {isExternal ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-1 underline-offset-4">
                      {post.title}
                    </a>
                  ) : (
                    <Link to={href} className="hover:underline decoration-1 underline-offset-4">
                      {post.title}
                    </Link>
                  )}
                </h3>
                {post.excerpt && (
                  <p className="font-body text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                )}
                <p className="font-body text-xs text-muted-foreground">{post.author_name || "Anonymous"}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
