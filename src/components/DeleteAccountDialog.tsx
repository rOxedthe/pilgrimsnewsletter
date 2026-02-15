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
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function DeleteAccountDialog() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) {
      toast({ title: "Error", description: "Failed to delete account. Please try again.", variant: "destructive" });
    } else {
      await supabase.auth.signOut();
      toast({ title: "Account deleted", description: "Your account has been permanently deleted." });
      navigate("/");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-wider text-destructive hover:underline">
          <Trash2 className="h-3.5 w-3.5" />
          Delete Account
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone. All your data, profile, and preferences will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Yes, delete my account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
