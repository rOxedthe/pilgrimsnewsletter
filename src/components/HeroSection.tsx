import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function HeroSection() {
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

      <div className="container relative z-10 grid min-h-[75vh] grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2">
        <div className="space-y-8 animate-fade-in">
          <h1 className="font-headline text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Where Ancient Wisdom
            <br />
            <span className="italic text-secondary">Meets the Modern Mind</span>
          </h1>

          <p className="max-w-lg font-body text-lg leading-relaxed text-muted-foreground">
            Deep essays on Himalayan philosophy, rare book discoveries, and the timeless art of
            mindful reading — curated from Asia's most legendary bookstore.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/subscribe"
              className="group inline-flex items-center gap-2 rounded bg-foreground px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-background transition-all hover:opacity-90"
            >
              Publish With Us
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://pilgrimsonline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded border border-foreground/30 px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-foreground transition-all hover:bg-foreground/10"
            >
              <ShoppingBag className="h-4 w-4" />
              Curated Collections
            </a>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="space-y-6 rounded border border-foreground/20 bg-foreground/5 p-8 backdrop-blur-md">
            <p className="font-headline text-lg italic text-muted-foreground">
              "The only bookshop in Asia where every shelf is a pilgrimage."
            </p>
            <div className="grid grid-cols-3 gap-6 border-t border-foreground/20 pt-6">
              {[
                { num: "40+", label: "Years" },
                { num: "50K+", label: "Rare Titles" },
                { num: "120+", label: "Countries" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-headline text-3xl font-bold text-foreground">{s.num}</div>
                  <div className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
