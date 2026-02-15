import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";

export default function HeroSection() {
  const { get } = usePageContent("/home");

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg, transparent, transparent 60px,
              hsl(var(--foreground)) 60px, hsl(var(--foreground)) 61px
            ), repeating-linear-gradient(
              90deg, transparent, transparent 60px,
              hsl(var(--foreground)) 60px, hsl(var(--foreground)) 61px
            )`,
          }}
        />
      </div>
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />

      <div className="container relative z-10 flex min-h-[75vh] items-center py-20">
        <div className="max-w-2xl space-y-8 animate-fade-in">
          <h1 className="font-headline text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            {get("hero_title_line1", "Where Ancient Wisdom")}
            <br />
            <span className="italic text-secondary">
              {get("hero_title_line2", "Meets the Modern Mind")}
            </span>
          </h1>

          <p className="max-w-lg font-body text-lg leading-relaxed text-muted-foreground">
            {get("hero_description", "Deep essays on Himalayan philosophy, rare book discoveries, and the timeless art of mindful reading — curated from Asia's most legendary bookstore.")}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to={get("hero_cta_primary_link", "/subscribe")}
              className="group inline-flex items-center gap-2 rounded bg-foreground px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-background transition-all hover:opacity-90"
            >
              {get("hero_cta_primary_text", "Publish With Us")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={get("hero_cta_secondary_link", "https://pilgrimsonline.com")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded border border-foreground/30 px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-foreground transition-all hover:bg-foreground/10"
            >
              <ShoppingBag className="h-4 w-4" />
              {get("hero_cta_secondary_text", "Curated Collections")}
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
