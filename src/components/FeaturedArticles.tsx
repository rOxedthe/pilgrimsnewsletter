import { Link } from "react-router-dom";
import { Lock, Clock, ArrowRight } from "lucide-react";
import featuredImg from "@/assets/featured-article.jpg";

const articles = [
  {
    id: "himalayan-wisdom",
    title: "The Lost Libraries of Mustang: A Journey Through Forbidden Knowledge",
    excerpt: "Deep within the former kingdom of Lo lies a trove of manuscripts that could reshape our understanding of Tibetan Buddhism...",
    author: "Dr. Tenzin Dorje",
    date: "Feb 10, 2026",
    readTime: "12 min read",
    image: featuredImg,
    premium: false,
    category: "Philosophy",
  },
  {
    id: "meditation-science",
    title: "The Neuroscience of Himalayan Meditation: What 1,000 Hours of Silence Reveals",
    excerpt: "Recent studies at Kathmandu University have produced startling results about the effects of prolonged silent retreat on neural plasticity...",
    author: "Maya Shakya",
    date: "Feb 6, 2026",
    readTime: "8 min read",
    premium: true,
    category: "Science",
  },
  {
    id: "rare-books",
    title: "First Editions Worth a Fortune: The Hidden Market of Himalayan Bibliophilia",
    excerpt: "From hand-printed Tibetan woodblock texts to Victorian-era expedition journals, the rare book market of the Himalayan region is booming...",
    author: "Rajesh Hamal",
    date: "Feb 2, 2026",
    readTime: "6 min read",
    premium: true,
    category: "Collections",
  },
];

export default function FeaturedArticles() {
  const main = articles[0];
  const rest = articles.slice(1);

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
          to="/article/himalayan-wisdom"
          className="hidden sm:inline-flex items-center gap-1 font-body text-sm font-semibold text-primary hover:underline"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Main feature */}
        <article className="lg:col-span-3 group">
          <Link to={`/article/${main.id}`} className="block overflow-hidden rounded">
            <img
              src={main.image}
              alt={main.title}
              className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          <div className="mt-5 space-y-3">
            <span className="inline-block font-body text-xs font-semibold uppercase tracking-widest text-secondary">
              {main.category}
            </span>
            <h3 className="font-headline text-2xl font-bold leading-tight text-foreground lg:text-3xl">
              <Link to={`/article/${main.id}`} className="hover:text-primary transition-colors">
                {main.title}
              </Link>
            </h3>
            <p className="font-body text-base leading-relaxed text-muted-foreground">
              {main.excerpt}
            </p>
            <div className="flex items-center gap-4 font-body text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{main.author}</span>
              <span>·</span>
              <span>{main.date}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {main.readTime}
              </span>
            </div>
          </div>
        </article>

        {/* Side articles */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {rest.map((a) => (
            <article key={a.id} className="group flex gap-4 border-b border-border pb-6 last:border-0">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
                    {a.category}
                  </span>
                  {a.premium && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                      <Lock className="h-2.5 w-2.5" /> Members
                    </span>
                  )}
                </div>
                <h4 className="font-headline text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                  <Link to={`/article/${a.id}`}>{a.title}</Link>
                </h4>
                <div className="flex items-center gap-3 font-body text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{a.author}</span>
                  <span>·</span>
                  <span>{a.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
