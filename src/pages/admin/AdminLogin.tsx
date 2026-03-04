import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowRight, Lock, AlertTriangle } from "lucide-react";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check lockout status on email change
  useEffect(() => {
    if (!email || email.length < 5) return;
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase.rpc("check_rate_limit", {
          _email: email,
          _max_attempts: MAX_ATTEMPTS,
          _window_minutes: LOCKOUT_MINUTES,
        });
        if (data === false) {
          setIsLocked(true);
          setLockoutRemaining(LOCKOUT_MINUTES);
        } else {
          setIsLocked(false);
        }
      } catch {
        // Silently fail - don't block login if rate limit check fails
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [email, failedAttempts]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [isLocked, lockoutRemaining]);

  const logLoginAttempt = async (attemptEmail: string, success: boolean) => {
    try {
      await supabase.from("login_attempts").insert({
        email: attemptEmail.toLowerCase().trim(),
        success,
      });
    } catch {
      // Silent fail
    }
  };

  const logAdminActivity = async (userId: string, userEmail: string, action: string) => {
    try {
      await supabase.from("admin_activity_log").insert({
        admin_id: userId,
        admin_email: userEmail,
        action,
        target_type: "auth",
        details: { timestamp: new Date().toISOString() },
      });
    } catch {
      // Silent fail
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast({
        title: "Account temporarily locked",
        description: `Too many failed attempts. Try again in ${lockoutRemaining} minute(s).`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const trimmedEmail = email.toLowerCase().trim();

    // Check rate limit before attempting login
    try {
      const { data: allowed } = await supabase.rpc("check_rate_limit", {
        _email: trimmedEmail,
        _max_attempts: MAX_ATTEMPTS,
        _window_minutes: LOCKOUT_MINUTES,
      });

      if (allowed === false) {
        setIsLocked(true);
        setLockoutRemaining(LOCKOUT_MINUTES);
        await logLoginAttempt(trimmedEmail, false);
        toast({
          title: "Account temporarily locked",
          description: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    } catch {
      // If rate limit check fails, allow the attempt
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      await logLoginAttempt(trimmedEmail, false);
      setFailedAttempts((prev) => prev + 1);

      const remaining = MAX_ATTEMPTS - failedAttempts - 1;
      toast({
        title: "Login failed",
        description: remaining > 0
          ? `Invalid credentials. ${remaining} attempt(s) remaining before lockout.`
          : `Account locked for ${LOCKOUT_MINUTES} minutes due to too many failed attempts.`,
        variant: "destructive",
      });

      if (remaining <= 0) {
        setIsLocked(true);
        setLockoutRemaining(LOCKOUT_MINUTES);
      }
    } else {
      // Login successful
      await logLoginAttempt(trimmedEmail, true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: hasRole } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (hasRole) {
          await logAdminActivity(user.id, trimmedEmail, "admin_login");
          navigate("/admin");
        } else {
          await supabase.auth.signOut();
          toast({
            title: "Access denied",
            description: "You do not have admin privileges.",
            variant: "destructive",
          });
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5">
            <Shield className="h-4 w-4 text-secondary" />
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
              Admin
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="font-body text-sm text-muted-foreground">Sign in to manage your site.</p>
        </div>

        {isLocked && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <p className="font-body text-sm font-semibold text-red-700">Account Temporarily Locked</p>
              <p className="font-body text-xs text-red-600">
                Too many failed login attempts. Try again in {lockoutRemaining} minute(s).
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded border border-border bg-card p-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-body text-xs uppercase tracking-wider text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLocked}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="font-body text-xs uppercase tracking-wider text-muted-foreground"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLocked}
              autoComplete="current-password"
            />
          </div>

          {failedAttempts > 0 && !isLocked && (
            <p className="font-body text-xs text-amber-600 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {MAX_ATTEMPTS - failedAttempts} attempt(s) remaining before lockout
            </p>
          )}

          <Button type="submit" disabled={loading || isLocked} className="w-full group">
            {loading ? "Signing in..." : isLocked ? "Locked" : "Sign In"}
            {!loading && !isLocked && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span className="font-body text-xs">Protected by rate limiting & encryption</span>
        </div>
      </div>
    </div>
  );
}
