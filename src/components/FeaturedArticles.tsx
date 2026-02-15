import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import AuthorAvatar from "@/components/AuthorAvatar";
import { useArticles } from "@/hooks/useArticles";
import featuredImg from "@/assets/featured-article.jpg";

export default function FeaturedArticles() {
  const { data: articles = [], isLoading } = useArticles({ featured: true, limit: 3 });

  if (isLoading) {
    return (
      <section className="container py-16 lg:py-24">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  const main = articles[0];
  const rest = articles.slice(1);
  const mainAuthor = main.author?.display_name || "Anonymous";

  return (
    <section className="container py-16 lg:py-24">
      <div className="mb-12 flex items-end justify-between border-b border-border pb-4">
        <div>
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
            Featured Reading
          </span>
          <h2 className="font-headline text-3xl font-bold text-foreground mt-1">
            Latest from the Review
          </h2>
        </div>
        <Link
          to="/blog"
          className="hidden sm:inline-flex items-center gap-1 font-body text-sm font-semibold text-primary hover:underline"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <article className="lg:col-span-3 group">
          <Link to={`/article/${main.slug}`} className="block overflow-hidden rounded">
            <img
              src={main.image_url || featuredImg}
              alt={main.title}
              className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          <div className="mt-5 space-y-3">
            <span className="inline-block font-body text-xs font-semibold uppercase tracking-widest text-secondary">
              {main.category}
            </span>
            <h3 className="font-headline text-2xl font-bold leading-tight text-foreground lg:text-3xl">
              <Link to={`/article/${main.slug}`} className="hover:text-primary transition-colors">
                {main.title}
              </Link>
            </h3>
            <p className="font-body text-base leading-relaxed text-muted-foreground">
              {main.excerpt}
            </p>
            <div className="flex items-center gap-3 font-body text-xs text-muted-foreground">
              <AuthorAvatar name={mainAuthor} avatarUrl={main.author?.avatar_url} size="md" />
              <span className="font-semibold text-foreground">{mainAuthor}</span>
              <span>·</span>
              <span>{new Date(main.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              {main.read_time && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {main.read_time}
                  </span>
                </>
              )}
            </div>
          </div>
        </article>

        <div className="lg:col-span-2 flex flex-col gap-8">
          {rest.map((a) => {
            const authorName = a.author?.display_name || "Anonymous";
            return (
              <article key={a.id} className="group flex gap-4 border-b border-border pb-6 last:border-0">
                <div className="flex-1 space-y-2">
                  <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
                    {a.category}
                  </span>
                  <h4 className="font-headline text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                    <Link to={`/article/${a.slug}`}>{a.title}</Link>
                  </h4>
                  <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                    <AuthorAvatar name={authorName} avatarUrl={a.author?.avatar_url} size="sm" />
                    <span className="font-semibold text-foreground">{authorName}</span>
                    {a.read_time && (
                      <>
                        <span>·</span>
                        <span>{a.read_time}</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
