import { Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import AuthorAvatar from "@/components/AuthorAvatar";
import featuredImg from "@/assets/featured-article.jpg";

export default function HeroSection() {
  const { data: featured = [], isLoading } = useArticles({ featured: true, limit: 3 });
  const { data: latest = [] } = useArticles({ limit: 4 });

  if (isLoading) {
    return (
      <section className="container py-10 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px_260px] animate-pulse">
          <div className="aspect-[4/3] bg-muted rounded" />
          <div className="space-y-4">
            <div className="h-40 bg-muted rounded" />
            <div className="h-40 bg-muted rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-6 w-24 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </div>
      </section>
    );
  }

  const main = featured[0];
  const secondary = featured.slice(1, 3);
  // Filter out duplicates from latest
  const featuredIds = new Set(featured.map((a) => a.id));
  const latestFiltered = latest.filter((a) => !featuredIds.has(a.id)).slice(0, 4);

  if (!main) return null;

  const mainAuthor = main.author?.display_name || "Anonymous";

  return (
    <section className="border-b border-border">
      <div className="container py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px_240px]">
          {/* Main featured article — large image with title below */}
          <article className="group">
            <Link to={`/article/${main.slug}`} className="block overflow-hidden rounded">
              <img
                src={main.image_url || featuredImg}
                alt={main.title}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </Link>
            <div className="mt-4 space-y-2">
              <span className="font-body text-xs font-bold uppercase tracking-widest text-editorial">
                {main.category}
              </span>
              <h1 className="font-headline text-2xl font-bold leading-tight text-foreground lg:text-3xl text-balance">
                <Link to={`/article/${main.slug}`} className="hover:underline decoration-1 underline-offset-4">
                  {main.title}
                </Link>
              </h1>
              <p className="font-body text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {main.excerpt}
              </p>
              <p className="font-body text-xs text-muted-foreground">{mainAuthor}</p>
            </div>
          </article>

          {/* Secondary articles — image + category + headline + excerpt */}
          <div className="flex flex-col gap-6">
            {secondary.map((a) => {
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
                    <h3 className="font-headline text-lg font-bold leading-snug text-foreground">
                      <Link to={`/article/${a.slug}`} className="hover:underline decoration-1 underline-offset-4">
                        {a.title}
                      </Link>
                    </h3>
                    <p className="font-body text-sm text-muted-foreground line-clamp-2">
                      {a.excerpt}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">{author}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* The Latest sidebar — headline-only list */}
          <aside className="hidden lg:block">
            <h2 className="font-headline text-lg font-bold text-foreground mb-4 pb-2 border-b-2 border-editorial">
              The Latest
            </h2>
            <div className="flex flex-col divide-y divide-border">
              {latestFiltered.map((a) => {
                const author = a.author?.display_name || "Anonymous";
                return (
                  <article key={a.id} className="py-4 first:pt-0">
                    <h4 className="font-headline text-base font-bold leading-snug text-foreground hover:underline decoration-1 underline-offset-4">
                      <Link to={`/article/${a.slug}`}>{a.title}</Link>
                    </h4>
                    <p className="font-body text-xs text-muted-foreground mt-1.5">{author}</p>
                  </article>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
