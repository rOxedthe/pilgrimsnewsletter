import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "cookie_consent";

export type CookiePreference = "accepted" | "rejected" | null;

export function getCookieConsent(): CookiePreference {
  return localStorage.getItem(COOKIE_KEY) as CookiePreference;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_KEY, "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-fade-in">
      <div className="container pb-6">
        <div className="rounded border border-border bg-card p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="h-6 w-6 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-body text-sm text-foreground font-semibold">We use cookies</p>
            <p className="font-body text-xs text-muted-foreground mt-1">
              We use cookies to enhance your experience, analyze site traffic, and personalize content. 
              By clicking "Accept", you consent to our use of cookies.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" size="sm" onClick={handleReject} className="text-xs uppercase tracking-wider">
              Decline
            </Button>
            <Button size="sm" onClick={handleAccept} className="text-xs uppercase tracking-wider">
              Accept
            </Button>
          </div>
          <button onClick={handleReject} className="absolute top-3 right-3 sm:hidden text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
