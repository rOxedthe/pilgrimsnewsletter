import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Mail, Lock, Trash2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent a confirmation link to your new email address." });
      setNewEmail("");
    }
    setLoadingEmail(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoadingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoadingPassword(false);
  };

  const handleDeleteAccount = async () => {
    setLoadingDelete(true);
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) {
      toast({ title: "Error", description: "Failed to delete account. Please try again.", variant: "destructive" });
    } else {
      await signOut();
      toast({ title: "Account deleted", description: "Your account has been permanently deleted." });
      navigate("/");
    }
    setLoadingDelete(false);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-lg py-16 space-y-10">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="font-headline text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="font-body text-muted-foreground mt-1">Manage your email, password, and account.</p>
        </div>

        {/* Change Email */}
        <form onSubmit={handleChangeEmail} className="space-y-4 rounded border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-secondary" />
            <h2 className="font-headline text-lg font-semibold text-foreground">Change Email</h2>
          </div>
          <p className="font-body text-xs text-muted-foreground">Current: {user.email}</p>
          <div className="space-y-2">
            <Label htmlFor="newEmail" className="font-body text-sm uppercase tracking-wider text-muted-foreground">New Email</Label>
            <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" required />
          </div>
          <Button type="submit" disabled={loadingEmail} size="sm">
            {loadingEmail ? "Updating..." : "Update Email"}
          </Button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="space-y-4 rounded border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-secondary" />
            <h2 className="font-headline text-lg font-semibold text-foreground">Change Password</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="font-body text-sm uppercase tracking-wider text-muted-foreground">New Password</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-body text-sm uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <Button type="submit" disabled={loadingPassword} size="sm">
            {loadingPassword ? "Updating..." : "Update Password"}
          </Button>
        </form>

        {/* Delete Account */}
        <div className="rounded border border-destructive/30 bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <h2 className="font-headline text-lg font-semibold text-foreground">Delete Account</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={loadingDelete}>
                <Trash2 className="h-4 w-4" />
                {loadingDelete ? "Deleting..." : "Delete My Account"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, profile, and all your data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
