import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generates or retrieves a persistent visitor ID stored in a cookie.
 * This identifies unique visitors without requiring login.
 */
function getVisitorId(): string {
  const key = "pn_visitor_id";
  const existing = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${key}=`))
    ?.split("=")[1];
  if (existing) return existing;

  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  // Set cookie to expire in 1 year
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${key}=${id}; expires=${expires}; path=/; SameSite=Lax`;
  return id;
}

/**
 * Generates a session ID that persists for the browser session.
 */
function getSessionId(): string {
  const key = "pn_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

/**
 * Determines the page type and article ID from the current path.
 */
function getPageInfo(path: string): { pageType: string; articleId?: string } {
  // Match /articles/:slug or /article/:slug
  if (/^\/(articles?)\/[^/]+$/.test(path) && !path.includes("/admin")) {
    return { pageType: "article" };
  }
  // Match /blog/:slug
  if (/^\/blog\/[^/]+$/.test(path) && !path.includes("/admin")) {
    return { pageType: "blog_post" };
  }
  // Match /landing or similar
  if (/^\/landing/.test(path) && !path.includes("/admin")) {
    return { pageType: "landing_post" };
  }
  return { pageType: "page" };
}

/**
 * PageTracker component - drop this into your app layout to track all page views.
 * It logs each navigation to the page_views table in Supabase.
 * 
 * Usage: Add <PageTracker /> inside your Router, e.g. in App.tsx or a layout component.
 */
export default function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith("/admin")) return;

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const { pageType } = getPageInfo(location.pathname);

    const trackView = async () => {
      try {
        await supabase.from("page_views").insert({
          page_path: location.pathname,
          page_title: document.title || null,
          page_type: pageType,
          visitor_id: visitorId,
          session_id: sessionId,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
        });
      } catch (err) {
        // Silently fail - tracking should never break the site
        console.warn("PageTracker error:", err);
      }
    };

    // Small delay to let the page title update
    const timeout = setTimeout(trackView, 300);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return null; // This component renders nothing
}
