import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, PenLine } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      <div className="container relative z-10 grid min-h-[75vh] grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2">
        <div className="space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 backdrop-blur">
            <PenLine className="h-4 w-4 text-secondary" />
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
              The Himalayan Review
            </span>
          </div>

          <h1 className="font-headline text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl text-balance">
            Where Ancient Wisdom
            <br />
            <span className="italic text-secondary">Meets the Modern Mind</span>
          </h1>

          <p className="max-w-lg font-body text-lg leading-relaxed text-primary-foreground/80">
            Deep essays on Himalayan philosophy, rare book discoveries, and the timeless art of
            mindful reading — curated from Asia's most legendary bookstore.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/subscribe"
              className="group inline-flex items-center gap-2 rounded bg-primary-foreground px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-primary transition-all hover:opacity-90"
            >
              Publish With Us
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://pilgrimsonline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded border border-primary-foreground/30 px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary-foreground/10"
            >
              <ShoppingBag className="h-4 w-4" />
              Curated Collections
            </a>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="space-y-6 rounded border border-primary-foreground/20 bg-foreground/30 p-8 backdrop-blur-md">
            <p className="font-headline text-lg italic text-primary-foreground/70">
              "The only bookshop in Asia where every shelf is a pilgrimage."
            </p>
            <div className="grid grid-cols-3 gap-6 border-t border-primary-foreground/20 pt-6">
              {[
                { num: "40+", label: "Years" },
                { num: "50K+", label: "Rare Titles" },
                { num: "120+", label: "Countries" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-headline text-3xl font-bold text-primary-foreground">{s.num}</div>
                  <div className="font-body text-xs uppercase tracking-wider text-primary-foreground/60">
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
