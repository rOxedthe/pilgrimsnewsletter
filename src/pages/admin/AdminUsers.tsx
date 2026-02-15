import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users, Crown, User } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  membership_tier: "member" | "premier_member";
  created_at: string;
}

const TIER_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  member: { label: "Member", variant: "outline" },
  premier_member: { label: "Premier Member", variant: "default" },
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: async ({ id, tier }: { id: string; tier: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ membership_tier: tier } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Membership updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filtered = profiles?.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.display_name?.toLowerCase().includes(q) ||
      p.username?.toLowerCase().includes(q) ||
      p.user_id.toLowerCase().includes(q)
    );
  });

  const memberCount = profiles?.filter((p) => p.membership_tier === "member").length ?? 0;
  const premierCount = profiles?.filter((p) => p.membership_tier === "premier_member").length ?? 0;

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-foreground">Users</h1>
        <p className="font-body text-sm text-muted-foreground">View and manage user memberships.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Users</span>
          </div>
          <p className="mt-2 font-headline text-2xl font-bold text-foreground">{profiles?.length ?? 0}</p>
        </div>
        <div className="rounded border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">Members</span>
          </div>
          <p className="mt-2 font-headline text-2xl font-bold text-foreground">{memberCount}</p>
        </div>
        <div className="rounded border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-muted-foreground" />
            <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">Premier Members</span>
          </div>
          <p className="mt-2 font-headline text-2xl font-bold text-foreground">{premierCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or username..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((profile) => {
                const tierInfo = TIER_LABELS[profile.membership_tier] ?? TIER_LABELS.member;
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-body text-sm font-medium text-foreground">
                          {profile.display_name || "Unnamed User"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {profile.username || "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={profile.membership_tier}
                        onValueChange={(v) => updateTierMutation.mutate({ id: profile.id, tier: v })}
                      >
                        <SelectTrigger className="h-8 w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" /> Member
                            </div>
                          </SelectItem>
                          <SelectItem value="premier_member">
                            <div className="flex items-center gap-2">
                              <Crown className="h-3 w-3" /> Premier Member
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
