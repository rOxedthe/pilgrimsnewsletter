import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BookSidebar from "@/components/BookSidebar";
import FooterSection from "@/components/FooterSection";
import AuthorAvatar from "@/components/AuthorAvatar";
import ArticleComments from "@/components/ArticleComments";
import { useArticleBySlug } from "@/hooks/useArticles";
import { Clock, Share2 } from "lucide-react";
import featuredImg from "@/assets/featured-article.jpg";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticleBySlug(slug);

  const authorName = article?.author?.display_name || "Anonymous";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {isLoading ? (
        <div className="container py-24">
          <div className="max-w-2xl mx-auto animate-pulse space-y-6">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      ) : !article ? (
        <div className="container py-24 text-center">
          <h1 className="font-headline text-3xl font-bold text-foreground">Article not found</h1>
          <p className="font-body text-muted-foreground mt-2">The article you're looking for doesn't exist.</p>
        </div>
      ) : (
        <>
          <div className="relative h-[40vh] overflow-hidden lg:h-[50vh]">
            <img src={article.image_url || featuredImg} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>

          <div className="container relative -mt-24 z-10 grid gap-12 pb-24 lg:grid-cols-[1fr_300px]">
            <article className="rounded bg-card p-6 shadow-lg sm:p-10 lg:p-14">
              <div className="mb-6 flex items-center gap-2">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
                  {article.category}
                </span>
              </div>

              <h1 className="font-headline text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-[2.75rem] text-balance">
                {article.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-border pb-5 font-body text-sm text-muted-foreground">
                <AuthorAvatar name={authorName} avatarUrl={article.author?.avatar_url} size="md" />
                <span className="font-semibold text-foreground">{authorName}</span>
                <span>·</span>
                <span>{new Date(article.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                {article.read_time && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {article.read_time}
                    </span>
                  </>
                )}
                <button className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>

              <div className="mt-8 space-y-6 font-body text-base leading-[1.85] text-foreground/90">
                {article.content?.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {article.author && (
                <div className="mt-12 rounded border border-border bg-cream-dark p-6">
                  <h4 className="font-headline text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">About the Author</h4>
                  <div className="flex items-start gap-4">
                    <AuthorAvatar name={authorName} avatarUrl={article.author.avatar_url} size="lg" />
                    <div>
                      <p className="font-headline text-base font-bold text-foreground">{authorName}</p>
                      {article.author.bio && (
                        <p className="font-body text-sm text-muted-foreground leading-relaxed mt-1">
                          {article.author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <ArticleComments articleId={article.id} />
            </article>

            <div className="hidden lg:block sticky top-20 self-start">
              <BookSidebar />
            </div>
          </div>
        </>
      )}

      <FooterSection />
    </div>
  );
}
