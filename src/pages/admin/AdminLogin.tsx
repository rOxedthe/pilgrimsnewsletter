import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = `${username.toLowerCase().trim()}@pilgrimsnewsletter.com`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      // Check admin role after login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: hasRole } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        if (hasRole) {
          navigate("/admin");
        } else {
          await supabase.auth.signOut();
          toast({ title: "Access denied", description: "You do not have admin privileges.", variant: "destructive" });
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
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">Admin</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="font-body text-sm text-muted-foreground">Sign in to manage your site.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-body text-xs uppercase tracking-wider text-muted-foreground">Username</Label>
            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-body text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="w-full group">
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
