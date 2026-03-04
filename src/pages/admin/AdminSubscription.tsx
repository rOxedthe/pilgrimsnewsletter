import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign, Plus, Trash2, Search, Filter,
  ChevronDown, ChevronUp, X
} from "lucide-react";

interface Payment {
  id: string;
  member_email: string;
  member_name: string | null;
  membership_tier: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

export default function AdminSubscriptions() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("payment_date");
  const [sortAsc, setSortAsc] = useState(false);

  // Form state
  const [memberEmail, setMemberEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [membershipTier, setMembershipTier] = useState("member");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NPR");
  const [paymentMethod, setPaymentMethod] = useState("manual");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-subscription-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_payments")
        .select("*")
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Payment[];
    },
  });

  const addPayment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("subscription_payments").insert({
        member_email: memberEmail.toLowerCase().trim(),
        member_name: memberName.trim() || null,
        membership_tier: membershipTier,
        amount: parseFloat(amount),
        currency,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] });
      toast({ title: "Payment added", description: "Subscription payment recorded successfully." });
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subscription_payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] });
      toast({ title: "Deleted", description: "Payment record removed." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setMemberEmail("");
    setMemberName("");
    setMembershipTier("member");
    setAmount("");
    setCurrency("NPR");
    setPaymentMethod("manual");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail || !amount || parseFloat(amount) <= 0) {
      toast({ title: "Validation error", description: "Please fill in email and a valid amount.", variant: "destructive" });
      return;
    }
    addPayment.mutate();
  };

  // Filter & sort
  const filtered = (payments ?? [])
    .filter((p) => {
      const matchSearch =
        p.member_email.toLowerCase().includes(search.toLowerCase()) ||
        (p.member_name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchTier = filterTier === "all" || p.membership_tier === filterTier;
      return matchSearch && matchTier;
    })
    .sort((a, b) => {
      let valA: any, valB: any;
      if (sortField === "payment_date") {
        valA = new Date(a.payment_date).getTime();
        valB = new Date(b.payment_date).getTime();
      } else if (sortField === "amount") {
        valA = a.amount;
        valB = b.amount;
      } else if (sortField === "member_email") {
        valA = a.member_email;
        valB = b.member_email;
      } else {
        valA = a.payment_date;
        valB = b.payment_date;
      }
      if (sortAsc) return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const thisMonthPayments = (payments ?? []).filter((p) => {
    const d = new Date(p.payment_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-foreground">Subscription Payments</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancel" : "Add Payment"}
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
              <DollarSign className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-headline font-bold">NPR {totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">This Month</p>
              <p className="text-2xl font-headline font-bold">NPR {thisMonthRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Payments</p>
              <p className="text-2xl font-headline font-bold">{(payments ?? []).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Payment Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Record New Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Member Email *
                </Label>
                <Input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Member Name
                </Label>
                <Input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Membership Tier *
                </Label>
                <select
                  value={membershipTier}
                  onChange={(e) => setMembershipTier(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="member">Member</option>
                  <option value="premier_member">Premier Member</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Amount (NPR) *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Payment Method
                </Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="manual">Manual</option>
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="fonepay">Fonepay</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Payment Date *
                </Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Notes
                </Label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this payment..."
                />
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button type="submit" disabled={addPayment.isPending}>
                  {addPayment.isPending ? "Saving..." : "Save Payment"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Tiers</option>
            <option value="member">Member</option>
            <option value="premier_member">Premier Member</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground font-body text-sm">Loading payments...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-body text-sm">
              {(payments ?? []).length === 0
                ? "No payments recorded yet. Click \"Add Payment\" to get started."
                : "No payments match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th
                      className="px-4 py-3 text-left font-body text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("payment_date")}
                    >
                      Date <SortIcon field="payment_date" />
                    </th>
                    <th
                      className="px-4 py-3 text-left font-body text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("member_email")}
                    >
                      Member <SortIcon field="member_email" />
                    </th>
                    <th className="px-4 py-3 text-left font-body text-xs uppercase tracking-wider text-muted-foreground">
                      Tier
                    </th>
                    <th
                      className="px-4 py-3 text-right font-body text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("amount")}
                    >
                      Amount <SortIcon field="amount" />
                    </th>
                    <th className="px-4 py-3 text-left font-body text-xs uppercase tracking-wider text-muted-foreground">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left font-body text-xs uppercase tracking-wider text-muted-foreground">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-right font-body text-xs uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((payment) => (
                    <tr key={payment.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-body text-foreground whitespace-nowrap">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-body text-sm font-medium text-foreground">{payment.member_name || "—"}</p>
                        <p className="font-body text-xs text-muted-foreground">{payment.member_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            payment.membership_tier === "premier_member"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {payment.membership_tier === "premier_member" ? "Premier" : "Member"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-body font-semibold text-foreground whitespace-nowrap">
                        {payment.currency} {Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground capitalize">
                        {payment.payment_method.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground max-w-[200px] truncate">
                        {payment.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this payment record?")) {
                              deletePayment.mutate(payment.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
