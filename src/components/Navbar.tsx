import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Articles", to: "/article/himalayan-wisdom" },
  { label: "Publish With Us", to: "/subscribe" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background backdrop-blur-none">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Pilgrims Book House" className="h-10 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`font-body text-sm tracking-wide uppercase transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://pilgrimsonline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded bg-shop px-4 py-2 text-xs font-semibold uppercase tracking-wider text-shop-foreground transition-all gold-glow hover:brightness-110"
          >
            Shop Online
          </a>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container flex flex-col gap-4 py-4">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-body text-sm uppercase tracking-wide text-muted-foreground hover:text-primary">
                {l.label}
              </Link>
            ))}
            <a href="https://pilgrimsonline.com" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 rounded bg-shop px-4 py-2 text-xs font-semibold uppercase tracking-wider text-shop-foreground">
              Shop Online
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
