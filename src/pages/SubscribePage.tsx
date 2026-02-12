import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Check, Star } from "lucide-react";

const tiers = [
  {
    name: "Wanderer",
    subtitle: "Free",
    price: "$0",
    period: "forever",
    benefits: [
      "Weekly curated newsletter",
      "3 articles per month",
      "Access to community discussions",
      "New arrival notifications",
    ],
    cta: "Sign Up Free",
    highlight: false,
  },
  {
    name: "Scholar",
    subtitle: "Most Popular",
    price: "$5",
    period: "/month",
    benefits: [
      "Unlimited article access",
      "Rare Book Alerts & early access",
      "10% discount on PilgrimsOnline",
      "Exclusive author interviews",
      "Member-only reading lists",
      "Ad-free experience",
    ],
    cta: "Become a Scholar",
    highlight: true,
  },
];

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
            Membership
          </span>
          <h1 className="mt-3 font-headline text-4xl font-bold text-foreground sm:text-5xl text-balance">
            Join the Inner Circle
          </h1>
          <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
            Access the full depth of Himalayan wisdom. Unlock every article, get rare book alerts, and receive exclusive discounts at PilgrimsOnline.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded border p-8 transition-shadow ${
                tier.highlight
                  ? "border-secondary bg-card shadow-xl ring-2 ring-secondary/30"
                  : "border-border bg-card shadow-sm hover:shadow-md"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-1 font-body text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                  <Star className="h-3 w-3" /> {tier.subtitle}
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-headline text-2xl font-bold text-foreground">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-headline text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="font-body text-sm text-muted-foreground">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 font-body text-sm text-foreground/80">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlight ? "text-secondary" : "text-shop"}`} />
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

        {/* Social proof */}
        <div className="mx-auto mt-16 max-w-xl text-center">
          <blockquote className="font-headline text-lg italic text-muted-foreground leading-relaxed">
            "Pilgrims Book House is the one shop in all Asia where the thoughtful traveler can find
            nourishment for the mind and soul."
          </blockquote>
          <cite className="mt-3 block font-body text-sm font-semibold text-foreground not-italic">
            — Jan Morris, Travel Writer
          </cite>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
