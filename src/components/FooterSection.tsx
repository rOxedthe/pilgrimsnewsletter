import { useState } from "react";
import { BookOpen, MapPin, Mail, Send, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";
import { supabase } from "@/integrations/supabase/client";

export default function FooterSection() {
  const { get } = usePageContent("/footer");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "exists">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setStatus("idle");

    try {
      const { data, error } = await supabase.functions.invoke("mailchimp", {
        body: { action: "subscribe", email: email.trim() },
      });

      if (error) throw error;

      if (data?.success) {
        if (data.message?.includes("already")) {
          setStatus("exists");
          setMessage("You're already subscribed!");
        } else {
          setStatus("success");
          setMessage("Welcome aboard! Check your inbox.");
          setEmail("");
        }
      } else {
        setStatus("error");
        setMessage(data?.error || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  };

  return (
    <footer className="border-t border-border bg-foreground text-primary-foreground">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-secondary" />
              <span className="font-headline text-xl font-bold">
                {get("brand_name", "Pilgrims Book House")}
              </span>
            </div>
            <p className="font-body text-sm leading-relaxed text-primary-foreground/70">
              {get("brand_description", "Asia's legendary independent bookstore — connecting seekers with wisdom since 1984.")}
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
              <a href={get("shop_url", "https://pilgrimsonline.com")} target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                Shop Online
              </a>
              <a href={get("store_url", "https://pilgrimsbooks.com")} target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                Visit the Store
              </a>
            </div>
          </div>

          {/* Visit */}
          <div className="space-y-4">
            <h4 className="font-headline text-sm font-bold uppercase tracking-wider text-secondary">
              Visit the Legend
            </h4>
            <div className="space-y-3 font-body text-sm text-primary-foreground/70">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>
                  {get("address_line1", "Thamel, Kathmandu, Nepal")}<br />
                  {get("address_line2", "Open daily 9 AM – 8 PM")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <span>{get("contact_email", "info@pilgrimsbooks.com")}</span>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h4 className="font-headline text-sm font-bold uppercase tracking-wider text-secondary">
              Newsletter
            </h4>
            <p className="font-body text-sm text-primary-foreground/70">
              Get our latest articles and stories delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 rounded border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2 font-body text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center rounded bg-secondary px-3 py-2 text-secondary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : status === "success" || status === "exists" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              {message && (
                <p className={`font-body text-xs ${status === "error" ? "text-red-400" : "text-secondary"}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center font-body text-xs text-primary-foreground/40">
          &copy; {new Date().getFullYear()} {get("brand_name", "Pilgrims Book House")}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
