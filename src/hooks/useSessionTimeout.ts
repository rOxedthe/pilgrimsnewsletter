import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * useSessionTimeout - Auto-logs out admin users after a period of inactivity.
 *
 * @param timeoutMinutes - Minutes of inactivity before auto-logout (default: 30)
 * @param warningMinutes - Minutes before timeout to show a warning (default: 5)
 *
 * Usage: Call this hook in your admin layout component:
 *   useSessionTimeout({ timeoutMinutes: 30, warningMinutes: 5 });
 */
export function useSessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
}: {
  timeoutMinutes?: number;
  warningMinutes?: number;
} = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasWarnedRef = useRef(false);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

  const handleLogout = useCallback(async () => {
    try {
      // Log the auto-logout
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_activity_log").insert({
          admin_id: user.id,
          admin_email: user.email,
          action: "auto_logout_inactivity",
          target_type: "auth",
          details: { reason: "Session timeout", timeout_minutes: timeoutMinutes },
        });
      }
    } catch {
      // Silent fail
    }

    await supabase.auth.signOut();
    navigate("/admin/login");
  }, [navigate, timeoutMinutes]);

  const showWarning = useCallback(() => {
    if (hasWarnedRef.current) return;
    hasWarnedRef.current = true;
    toast({
      title: "Session expiring soon",
      description: `You'll be logged out in ${warningMinutes} minute(s) due to inactivity. Move your mouse or press a key to stay logged in.`,
      variant: "destructive",
    });
  }, [toast, warningMinutes]);

  const resetTimers = useCallback(() => {
    hasWarnedRef.current = false;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    warningRef.current = setTimeout(showWarning, warningMs);
    timeoutRef.current = setTimeout(handleLogout, timeoutMs);
  }, [handleLogout, showWarning, timeoutMs, warningMs]);

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => resetTimers();

    // Start timers
    resetTimers();

    // Listen for user activity
    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimers]);
}
