import { BookOpen, MapPin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function FooterSection() {
  return (
    <footer className="border-t border-border bg-foreground text-primary-foreground">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-secondary" />
              <span className="font-headline text-xl font-bold">Pilgrims Book House</span>
            </div>
            <p className="font-body text-sm leading-relaxed text-primary-foreground/70">
              Asia's legendary independent bookstore — connecting seekers with wisdom since 1984.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-headline text-sm font-bold uppercase tracking-wider text-secondary">
              Explore
            </h4>
            <div className="flex flex-col gap-2 font-body text-sm text-primary-foreground/70">
              <Link to="/" className="hover:text-secondary transition-colors">The Himalayan Review</Link>
              <Link to="/subscribe" className="hover:text-secondary transition-colors">Subscribe</Link>
              <a href="https://pilgrimsonline.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                Shop Online
              </a>
              <a href="https://pilgrimsbooks.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                Visit the Store
              </a>
            </div>
          </div>

          {/* Visit the Legend */}
          <div className="space-y-4">
            <h4 className="font-headline text-sm font-bold uppercase tracking-wider text-secondary">
              Visit the Legend
            </h4>
            <div className="space-y-3 font-body text-sm text-primary-foreground/70">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>Thamel, Kathmandu, Nepal<br />Open daily 9 AM – 8 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <span>info@pilgrimsbooks.com</span>
              </div>
              <a
                href="https://pilgrimsbooks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 rounded border border-secondary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-secondary transition-all hover:bg-secondary/10"
              >
                Plan Your Visit →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center font-body text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Pilgrims Book House. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
