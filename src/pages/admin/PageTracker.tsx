import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function getVisitorId(): string {
  const key = "pn_visitor_id";
  const existing = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${key}=`))
    ?.split("=")[1];
  if (existing) return existing;

  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${key}=${id}; expires=${expires}; path=/; SameSite=Lax`;
  return id;
}

function getSessionId(): string {
  const key = "pn_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

function getPageInfo(path: string): { pageType: string } {
  if (/^\/(articles?)\/[^/]+$/.test(path) && !path.includes("/admin")) {
    return { pageType: "article" };
  }
  if (/^\/blog\/[^/]+$/.test(path) && !path.includes("/admin")) {
    return { pageType: "blog_post" };
  }
  if (/^\/landing/.test(path) && !path.includes("/admin")) {
    return { pageType: "landing_post" };
  }
  return { pageType: "page" };
}

export default function PageTracker() {
  const location = useLocation();

  useEffect(() => {
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
        console.warn("PageTracker error:", err);
      }
    };

    const timeout = setTimeout(trackView, 300);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return null;
}
