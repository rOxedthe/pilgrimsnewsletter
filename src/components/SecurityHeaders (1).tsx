import { useEffect } from "react";

/**
 * SecurityHeaders - Adds security-related meta tags to the document head.
 *
 * For full CSP headers, you should also configure them on your hosting provider
 * (Vercel, Netlify, etc.) via response headers. These meta tags provide a baseline.
 *
 * Usage: Add <SecurityHeaders /> in your App.tsx or main layout.
 */
export default function SecurityHeaders() {
  useEffect(() => {
    // Content Security Policy
    const csp = document.createElement("meta");
    csp.httpEquiv = "Content-Security-Policy";
    csp.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
      "img-src 'self' data: blob: https: http:",
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    document.head.appendChild(csp);

    // Prevent MIME type sniffing
    const noSniff = document.createElement("meta");
    noSniff.httpEquiv = "X-Content-Type-Options";
    noSniff.content = "nosniff";
    document.head.appendChild(noSniff);

    // Prevent clickjacking
    const frameOptions = document.createElement("meta");
    frameOptions.httpEquiv = "X-Frame-Options";
    frameOptions.content = "DENY";
    document.head.appendChild(frameOptions);

    // Referrer policy - don't leak full URLs
    const referrer = document.createElement("meta");
    referrer.setAttribute("name", "referrer");
    referrer.content = "strict-origin-when-cross-origin";
    document.head.appendChild(referrer);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(csp);
      document.head.removeChild(noSniff);
      document.head.removeChild(frameOptions);
      document.head.removeChild(referrer);
    };
  }, []);

  return null;
}
