import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
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
        body: {
          action: "subscribe",
          email: email.trim(),
          firstName: firstName.trim(),
        },
      });

      if (error) throw error;

      if (data?.success) {
        if (data.message?.includes("already")) {
          setStatus("exists");
          setMessage("You're already part of the family!");
        } else {
          setStatus("success");
          setMessage("Welcome! Check your inbox for a confirmation.");
          setEmail("");
          setFirstName("");
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
      }, 6000);
    }
  };

  return (
    <section className="relative overflow-hidden bg-foreground py-20 lg:py-28">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          {/* Icon */}
          <div className="mb-6 inline-flex items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 p-3">
            <Mail className="h-6 w-6 text-secondary" />
          </div>

          {/* Heading */}
          <h2 className="font-headline text-3xl font-bold text-primary-foreground sm:text-4xl">
            Stories Delivered to Your Inbox
          </h2>
          <p className="mt-4 font-body text-base text-primary-foreground/70 leading-relaxed max-w-lg mx-auto">
            Join our community of readers and get the latest articles on Himalayan culture, literature, and heritage — delivered weekly, for free.
          </p>

          {/* Form */}
          <form onSubmit={handleSubscribe} className="mt-8 mx-auto max-w-md">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="rounded border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 font-body text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary sm:w-36"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 rounded border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 font-body text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded bg-secondary px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-secondary-foreground transition-all hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === "success" || status === "exists" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Subscribe
                  </>
                )}
              </button>
            </div>

            {/* Status message */}
            {message && (
              <p className={`mt-3 font-body text-sm ${status === "error" ? "text-red-400" : "text-secondary"}`}>
                {message}
              </p>
            )}
          </form>

          {/* Trust line */}
          <p className="mt-6 font-body text-xs text-primary-foreground/40">
            Free forever. No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
