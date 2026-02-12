import Navbar from "@/components/Navbar";
import BookSidebar from "@/components/BookSidebar";
import StickyPaywallBanner from "@/components/StickyPaywallBanner";
import FooterSection from "@/components/FooterSection";
import { Clock, Share2 } from "lucide-react";
import featuredImg from "@/assets/featured-article.jpg";

const articleContent = [
  "Deep within the rain shadow of the Annapurna range, where the wind carves stories into sandstone cliffs, lies a civilization of books. The former kingdom of Lo — known to the outside world as Upper Mustang — harbored for centuries a collection of manuscripts that scholars are only now beginning to understand.",
  "These are not merely religious texts. They are maps of consciousness, drawn by monks who spent decades in silent contemplation, attempting to chart the territory between thought and the absence of thought. Written on handmade paper from the Daphne plant, using ink made from local minerals and soot, each manuscript is itself a work of art.",
  "The discovery was made almost by accident. In 2019, a team of conservation specialists from Kathmandu University, working to stabilize a crumbling monastery wall in Lo Manthang, found a sealed chamber behind a mural depicting Guru Rinpoche. Inside were over 400 texts, some dating back to the 13th century.",
  "'It was like finding a library that had been frozen in time,' recalls Dr. Tenzin Dorje, who led the excavation. 'The dry climate of Upper Mustang had preserved them remarkably well. Some of the illustrations still had their original gold leaf intact.'",
  "What makes these manuscripts particularly significant is their content. While many are Buddhist sutras and tantric commentaries that can be found in other Tibetan collections, approximately 80 of the texts appear to be unique — medical treatises, astronomical observations, and philosophical dialogues that exist nowhere else in the world.",
  "The medical texts are especially intriguing. They describe treatments for ailments using plants and minerals found only in the Trans-Himalayan ecosystem, some of which modern pharmacology has yet to analyze. Early chemical analysis of some of the recommended compounds has shown promising anti-inflammatory properties.",
  "But the philosophical works are perhaps the most profound. Unlike the hierarchical approach of mainstream Tibetan Buddhist pedagogy, these texts present knowledge as a series of conversations — between teacher and student, between the mind and the mountain, between silence and the echo that follows. They suggest a more egalitarian tradition of learning than previously documented in the region.",
  "For pilgrims and seekers who have long made the journey to Nepal's bookshops and monasteries, this discovery validates what many have intuited: that the Himalayas hold knowledge systems that the modern world is only beginning to appreciate. The manuscripts of Mustang remind us that wisdom is not always found in the loudest voices or the most accessible libraries, but sometimes in the silence of a sealed room, waiting patiently to be heard.",
];

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero image */}
      <div className="relative h-[40vh] overflow-hidden lg:h-[50vh]">
        <img src={featuredImg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="container relative -mt-24 z-10 grid gap-12 pb-24 lg:grid-cols-[1fr_300px]">
        {/* Article */}
        <article className="rounded bg-card p-6 shadow-lg sm:p-10 lg:p-14">
          <div className="mb-6 flex items-center gap-2">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
              Philosophy
            </span>
          </div>

          <h1 className="font-headline text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-[2.75rem] text-balance">
            The Lost Libraries of Mustang: A Journey Through Forbidden Knowledge
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-border pb-5 font-body text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Dr. Tenzin Dorje</span>
            <span>·</span>
            <span>February 10, 2026</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> 12 min read
            </span>
            <button className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>

          <div className="mt-8 space-y-6 font-body text-base leading-[1.85] text-foreground/90">
            {articleContent.slice(0, 3).map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            {/* Native ad after paragraph 3 */}
            <div className="rounded border border-secondary/30 bg-secondary/5 p-5 text-center">
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">From Our Collection</p>
              <p className="font-headline text-base font-semibold text-foreground">
                Enjoying this topic? Explore our Himalayan Philosophy collection on{" "}
                <a href="https://pilgrimsonline.com" target="_blank" rel="noopener noreferrer" className="text-shop underline">
                  PilgrimsOnline
                </a>
              </p>
            </div>

            {articleContent.slice(3, 5).map((p, i) => (
              <p key={i + 3}>{p}</p>
            ))}

            {/* Paywall blur zone */}
            <div className="relative">
              <div className="paywall-blur space-y-6">
                {articleContent.slice(5).map((p, i) => (
                  <p key={i + 5}>{p}</p>
                ))}
              </div>

              {/* Paywall overlay */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-2 pt-32">
                <div className="w-full max-w-md rounded border border-border bg-card p-8 text-center shadow-xl">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-headline text-2xl text-primary">🔒</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-foreground">
                    Continue Reading
                  </h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    This is a premium article. Join the Inner Circle for unlimited access.
                  </p>
                  <a
                    href="/subscribe"
                    className="mt-4 inline-block rounded bg-primary px-8 py-3 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-125"
                  >
                    Become a Scholar — $5/mo
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Author bio */}
          <div className="mt-12 rounded border border-border bg-cream-dark p-6">
            <h4 className="font-headline text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">About the Author</h4>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-headline text-lg font-bold text-primary-foreground">
                TD
              </div>
              <div>
                <p className="font-headline text-base font-bold text-foreground">Dr. Tenzin Dorje</p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mt-1">
                  Tibetologist and professor of Buddhist Studies at Kathmandu University. Author of <em>"Echoes in Emptiness"</em> — available at{" "}
                  <a href="https://pilgrimsonline.com" target="_blank" rel="noopener noreferrer" className="text-shop underline">
                    PilgrimsOnline
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <div className="hidden lg:block sticky top-20 self-start">
          <BookSidebar />
        </div>
      </div>

      <StickyPaywallBanner articlesLeft={1} />
      <FooterSection />
    </div>
  );
}
