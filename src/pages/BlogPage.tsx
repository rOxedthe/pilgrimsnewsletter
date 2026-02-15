import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import AuthorAvatar from "@/components/AuthorAvatar";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const categories = ["All", "Culture", "Heritage", "Community", "Literature", "Philosophy", "Science", "Collections"];

const allPosts = [
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
  {
    id: "himalayan-wisdom",
    title: "The Lost Libraries of Mustang: A Journey Through Forbidden Knowledge",
    excerpt: "Deep within the former kingdom of Lo lies a trove of manuscripts that could reshape our understanding of Tibetan Buddhism.",
    author: "Dr. Tenzin Dorje",
    date: "Feb 10, 2026",
    category: "Philosophy",
  },
  {
    id: "meditation-science",
    title: "The Neuroscience of Himalayan Meditation: What 1,000 Hours of Silence Reveals",
    excerpt: "Recent studies at Kathmandu University have produced startling results about the effects of prolonged silent retreat on neural plasticity.",
    author: "Maya Shakya",
    date: "Feb 6, 2026",
    category: "Science",
  },
  {
    id: "rare-books",
    title: "First Editions Worth a Fortune: The Hidden Market of Himalayan Bibliophilia",
    excerpt: "From hand-printed Tibetan woodblock texts to Victorian-era expedition journals, the rare book market of the Himalayan region is booming.",
    author: "Rajesh Hamal",
    date: "Feb 2, 2026",
    category: "Collections",
  },
  {
    id: "kathmandu-poetry",
    title: "The Poetry Slams of Kathmandu: A New Literary Movement",
    excerpt: "Young poets are fusing Nepali verse with hip-hop rhythms, creating a vibrant spoken-word scene in the capital's cafés.",
    author: "Priya Maharjan",
    date: "Jan 28, 2026",
    category: "Culture",
  },
];

export default function BlogPage() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? allPosts : allPosts.filter((p) => p.category === active);

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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                  <AuthorAvatar name={post.author} size="sm" />
                  <span className="font-semibold text-foreground">{post.author}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
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
