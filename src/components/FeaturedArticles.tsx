import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthorAvatar from "@/components/AuthorAvatar";
import { useArticles } from "@/hooks/useArticles";
import featuredImg from "@/assets/featured-article.jpg";

export default function FeaturedArticles() {
  const { data: articles = [], isLoading } = useArticles({ limit: 4 });

  if (isLoading) {
    return (
      <section className="container py-12 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
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

  if (articles.length === 0) return null;

  return (
    <section className="container py-12 lg:py-20">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-headline text-2xl font-bold text-foreground">
          Popular on Pilgrims
        </h2>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 font-body text-sm font-semibold text-editorial hover:underline"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((a) => {
          const author = a.author?.display_name || "Anonymous";
          return (
            <article key={a.id} className="group">
              <Link to={`/article/${a.slug}`} className="block overflow-hidden rounded">
                <img
                  src={a.image_url || featuredImg}
                  alt={a.title}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </Link>
              <div className="mt-3 space-y-1.5">
                <span className="font-body text-xs font-bold uppercase tracking-widest text-editorial">
                  {a.category}
                </span>
                <h3 className="font-headline text-base font-bold leading-snug text-foreground">
                  <Link to={`/article/${a.slug}`} className="hover:underline decoration-1 underline-offset-4">
                    {a.title}
                  </Link>
                </h3>
                <p className="font-body text-xs text-muted-foreground">{author}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
