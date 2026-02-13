import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";

const categories = ["All", "Culture", "Heritage", "Community", "Literature"];

const blogPosts = [
  {
    id: "thamel-bookshops",
    title: "A Walking Tour of Thamel's Hidden Bookshops",
    excerpt: "Beyond the tourist bustle lies a network of quiet literary havens that have shaped generations of travelers and thinkers.",
    author: "Sita Thapa",
    date: "Feb 12, 2026",
    category: "Culture",
  },
  {
    id: "printing-press-nepal",
    title: "The Revival of Nepal's Woodblock Printing Tradition",
    excerpt: "A new generation of artisans is breathing life into ancient printing techniques, creating works that bridge centuries.",
    author: "Kamal Adhikari",
    date: "Feb 9, 2026",
    category: "Heritage",
  },
  {
    id: "reading-habits",
    title: "How Himalayan Communities Are Building Reading Cultures",
    excerpt: "From mobile libraries on mule-back to community reading rooms, literacy initiatives are transforming remote villages.",
    author: "Anita Gurung",
    date: "Feb 5, 2026",
    category: "Community",
  },
  {
    id: "translation-movement",
    title: "Translating the Untranslatable: Nepal's Literary Bridge Builders",
    excerpt: "Meet the translators making Nepali and Tibetan literature accessible to the world for the first time.",
    author: "Bibek Sharma",
    date: "Feb 1, 2026",
    category: "Literature",
  },
];

export default function BlogSection() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? blogPosts : blogPosts.filter((p) => p.category === active);

  return (
    <section className="bg-muted/50 py-16 lg:py-24">
      <div className="container">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
          <div>
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
              From the Blog
            </span>
            <h2 className="font-headline text-3xl font-bold text-foreground mt-1">
              Stories & Insights
            </h2>
          </div>
          <Link
            to="/article/thamel-bookshops"
            className="hidden sm:inline-flex items-center gap-1 font-body text-sm font-semibold text-primary hover:underline"
          >
            All Posts <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="group rounded border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <span className="inline-block font-body text-xs font-semibold uppercase tracking-widest text-secondary mb-3">
                {post.category}
              </span>
              <h3 className="font-headline text-lg font-bold leading-snug text-foreground mb-2 group-hover:text-secondary transition-colors">
                <Link to={`/article/${post.id}`}>{post.title}</Link>
              </h3>
              <p className="font-body text-sm leading-relaxed text-muted-foreground mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-3 font-body text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {post.author}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
