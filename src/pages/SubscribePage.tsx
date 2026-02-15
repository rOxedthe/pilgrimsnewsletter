import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Check, Star, PenLine, BookOpen } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";

export default function SubscribePage() {
  const { get } = usePageContent("/subscribe");

  const tiers = [
    {
      name: "Reader",
      subtitle: "Free",
      price: get("reader_tier_price", "$0"),
      period: "forever",
      benefits: [
        "Unlimited article reading",
        "Weekly curated newsletter",
        "Access to community discussions",
        "New arrival notifications",
      ],
      cta: "Sign Up Free",
      highlight: false,
      icon: BookOpen,
    },
    {
      name: "Contributor",
      subtitle: "Most Popular",
      price: get("contributor_tier_price", "$5"),
      period: "/month",
      benefits: [
        "Publish blog posts & articles",
        "Send newsletters to your audience",
        "Author profile & bio page",
        "Featured in 'Contributor Picks'",
        "10% discount on PilgrimsOnline",
        "Priority editorial review",
      ],
      cta: "Become a Contributor",
      highlight: true,
      icon: PenLine,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
            {get("page_subtitle", "Publish With Us")}
          </span>
          <h1 className="mt-3 font-headline text-4xl font-bold text-foreground sm:text-5xl text-balance">
            {get("page_title", "Share Your Voice")}
          </h1>
          <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
            {get("page_description", "All articles are free to read. Become a Contributor to publish your own blogs, essays, and newsletters on the Himalayan Review platform.")}
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded border p-8 transition-shadow ${
                tier.highlight
                  ? "border-primary bg-card shadow-xl ring-2 ring-primary/20"
                  : "border-border bg-card shadow-sm hover:shadow-md"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  <Star className="h-3 w-3" /> {tier.subtitle}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <tier.icon className={`h-5 w-5 ${tier.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-headline text-2xl font-bold text-foreground">{tier.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="font-body text-sm text-muted-foreground">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 font-body text-sm text-foreground/80">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlight ? "text-primary" : "text-shop"}`} />
                    {b}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded py-3 font-body text-sm font-semibold uppercase tracking-wider transition-all ${
                  tier.highlight
                    ? "bg-primary text-primary-foreground hover:brightness-125"
                    : "border border-border bg-cream-dark text-foreground hover:bg-muted"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-xl text-center">
          <blockquote className="font-headline text-lg italic text-muted-foreground leading-relaxed">
            "{get("page_quote", "Pilgrims Book House is the one shop in all Asia where the thoughtful traveler can find nourishment for the mind and soul.")}"
          </blockquote>
          <cite className="mt-3 block font-body text-sm font-semibold text-foreground not-italic">
            {get("page_quote_author", "— Jan Morris, Travel Writer")}
          </cite>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
