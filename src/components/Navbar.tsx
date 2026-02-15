import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Articles", to: "/blog" },
  { label: "Publish With Us", to: "/subscribe" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background">
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
          {user ? (
            <div className="flex items-center gap-3">
              <span className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {user.email?.split("@")[0]}
              </span>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-body text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:border-foreground"
              >
                <Settings className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-body text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:border-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Link>
          )}
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
            {user ? (
              <>
                <Link to="/settings" onClick={() => setOpen(false)} className="inline-flex w-fit items-center gap-1.5 font-body text-sm uppercase tracking-wide text-muted-foreground hover:text-primary">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="inline-flex w-fit items-center gap-1.5 font-body text-sm uppercase tracking-wide text-muted-foreground hover:text-primary">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="inline-flex w-fit items-center gap-1.5 font-body text-sm uppercase tracking-wide text-muted-foreground hover:text-primary">
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
