import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  FileText, Globe, Settings, Plus, BookImage, LayoutDashboard,
  DollarSign, Users, TrendingUp, BarChart3, CreditCard,
  Eye, MousePointerClick, Activity, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Area, AreaChart
} from "recharts";

/* ── Tooltips ─────────────────────────────────────────────────── */

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="font-body text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="font-body text-xs" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" && entry.name.toLowerCase().includes("revenue")
            ? `NPR ${entry.value.toLocaleString()}`
            : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const PieTooltipComp = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="font-body text-xs font-semibold" style={{ color: payload[0].payload.color }}>
        {payload[0].name}: {payload[0].value} {payload[0].payload.unit ?? ""}
      </p>
    </div>
  );
};

/* ── Time Period Filter Component ─────────────────────────────── */

type Period = "today" | "7d" | "30d" | "month" | "custom";

function getDateRange(period: Period, customStart: string, customEnd: string): { start: Date; end: Date } {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case "today": {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      return { start: s, end: endOfDay };
    }
    case "7d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      s.setHours(0, 0, 0, 0);
      return { start: s, end: endOfDay };
    }
    case "30d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      s.setHours(0, 0, 0, 0);
      return { start: s, end: endOfDay };
    }
    case "month": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { start: s, end: endOfDay };
    }
    case "custom": {
      const s = customStart ? new Date(customStart + "T00:00:00") : new Date(now.getFullYear(), now.getMonth(), 1);
      const e = customEnd ? new Date(customEnd + "T23:59:59.999") : endOfDay;
      return { start: s, end: e };
    }
    default:
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfDay };
  }
}

function getDaysBetween(start: Date, end: Date): { key: string; label: string }[] {
  const days: { key: string; label: string }[] = [];
  const current = new Date(start);
  while (current <= end) {
    const key = current.toISOString().split("T")[0];
    const label = current.toLocaleDateString("default", { month: "short", day: "numeric" });
    days.push({ key, label });
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function PeriodTabs({
  period,
  setPeriod,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
}: {
  period: Period;
  setPeriod: (p: Period) => void;
  customStart: string;
  setCustomStart: (s: string) => void;
  customEnd: string;
  setCustomEnd: (s: string) => void;
}) {
  const tabs: { value: Period; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
    { value: "month", label: "Month" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex rounded-lg border border-border overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPeriod(tab.value)}
            className={`px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
              period === tab.value
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {period === "custom" && (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="h-8 w-36 text-xs"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="h-8 w-36 text-xs"
          />
        </div>
      )}
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────────── */

const typeColors: Record<string, string> = {
  page: "#6366f1",
  article: "#10b981",
  blog_post: "#f59e0b",
  landing_post: "#ec4899",
};
const typeLabels: Record<string, string> = {
  page: "Pages",
  article: "Articles",
  blog_post: "Blog Posts",
  landing_post: "Landing",
};

/* ── Main Component ───────────────────────────────────────────── */

export default function AdminDashboard() {
  // Time filters - separate for traffic and revenue
  const [trafficPeriod, setTrafficPeriod] = useState<Period>("30d");
  const [trafficCustomStart, setTrafficCustomStart] = useState("");
  const [trafficCustomEnd, setTrafficCustomEnd] = useState("");

  const [revenuePeriod, setRevenuePeriod] = useState<Period>("30d");
  const [revenueCustomStart, setRevenueCustomStart] = useState("");
  const [revenueCustomEnd, setRevenueCustomEnd] = useState("");

  /* ── Content queries ──────────────────────────────────────── */
  const { data: articleStats } = useQuery({
    queryKey: ["admin-article-stats"],
    queryFn: async () => {
      const { count: total } = await supabase.from("articles").select("*", { count: "exact", head: true });
      const { count: published } = await supabase.from("articles").select("*", { count: "exact", head: true }).eq("published", true);
      const { count: drafts } = await supabase.from("articles").select("*", { count: "exact", head: true }).eq("published", false);
      return { total: total ?? 0, published: published ?? 0, drafts: drafts ?? 0 };
    },
  });

  const { data: blogStats } = useQuery({
    queryKey: ["admin-blog-stats"],
    queryFn: async () => {
      const { count: total } = await supabase.from("blog_posts").select("*", { count: "exact", head: true });
      const { count: published } = await supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("published", true);
      const { count: drafts } = await supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("published", false);
      return { total: total ?? 0, published: published ?? 0, drafts: drafts ?? 0 };
    },
  });

  const { data: landingStats } = useQuery({
    queryKey: ["admin-landing-stats"],
    queryFn: async () => {
      const { count: total } = await supabase.from("landing_posts").select("*", { count: "exact", head: true });
      const { count: published } = await supabase.from("landing_posts").select("*", { count: "exact", head: true }).eq("published", true);
      return { total: total ?? 0, published: published ?? 0 };
    },
  });

  const { data: recentArticles } = useQuery({
    queryKey: ["admin-recent-articles"],
    queryFn: async () => {
      const { data } = await supabase.from("articles").select("id, title, slug, published, created_at").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const { data: recentBlogs } = useQuery({
    queryKey: ["admin-recent-blogs"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("id, title, slug, published, created_at").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  /* ── Data queries ─────────────────────────────────────────── */
  const { data: payments } = useQuery({
    queryKey: ["admin-subscription-payments-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_payments").select("*").order("payment_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: pageViews } = useQuery({
    queryKey: ["admin-page-views"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_views").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  /* ══════════════════════════════════════════════════════════════
     TRAFFIC ANALYTICS (filtered by period)
     ══════════════════════════════════════════════════════════════ */
  const trafficRange = useMemo(
    () => getDateRange(trafficPeriod, trafficCustomStart, trafficCustomEnd),
    [trafficPeriod, trafficCustomStart, trafficCustomEnd]
  );

  const filteredViews = useMemo(() => {
    return (pageViews ?? []).filter((v) => {
      const d = new Date(v.created_at);
      return d >= trafficRange.start && d <= trafficRange.end;
    });
  }, [pageViews, trafficRange]);

  const totalViews = filteredViews.length;
  const uniqueVisitors = new Set(filteredViews.map((v) => v.visitor_id)).size;

  const today = new Date().toISOString().split("T")[0];
  const todayViews = (pageViews ?? []).filter((v) => v.created_at?.startsWith(today)).length;

  // Daily chart data
  const trafficDays = useMemo(() => getDaysBetween(trafficRange.start, trafficRange.end), [trafficRange]);
  const dailyViewsData = useMemo(() => {
    return trafficDays.map(({ key, label }) => {
      const count = filteredViews.filter((v) => v.created_at?.startsWith(key)).length;
      return { day: label, views: count };
    });
  }, [trafficDays, filteredViews]);

  const avgViewsPerDay = trafficDays.length > 0
    ? Math.round(totalViews / trafficDays.length)
    : 0;

  // Top articles
  const topArticles = useMemo(() => {
    const map: Record<string, { path: string; title: string; views: number }> = {};
    filteredViews.filter((v) => v.page_type === "article").forEach((v) => {
      if (!map[v.page_path]) map[v.page_path] = { path: v.page_path, title: v.page_title || v.page_path, views: 0 };
      map[v.page_path].views++;
    });
    return Object.values(map).sort((a, b) => b.views - a.views).slice(0, 5);
  }, [filteredViews]);

  // Top blogs
  const topBlogs = useMemo(() => {
    const map: Record<string, { path: string; title: string; views: number }> = {};
    filteredViews.filter((v) => v.page_type === "blog_post").forEach((v) => {
      if (!map[v.page_path]) map[v.page_path] = { path: v.page_path, title: v.page_title || v.page_path, views: 0 };
      map[v.page_path].views++;
    });
    return Object.values(map).sort((a, b) => b.views - a.views).slice(0, 5);
  }, [filteredViews]);

  // All pages ranked
  const topPages = useMemo(() => {
    const map: Record<string, { path: string; title: string; type: string; views: number; visitors: Set<string> }> = {};
    filteredViews.forEach((v) => {
      if (!map[v.page_path]) map[v.page_path] = { path: v.page_path, title: v.page_title || v.page_path, type: v.page_type || "page", views: 0, visitors: new Set() };
      map[v.page_path].views++;
      map[v.page_path].visitors.add(v.visitor_id);
    });
    return Object.values(map).map((p) => ({ ...p, unique: p.visitors.size })).sort((a, b) => b.views - a.views).slice(0, 10);
  }, [filteredViews]);

  // Page type pie
  const pageTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredViews.forEach((v) => { const t = v.page_type || "page"; counts[t] = (counts[t] || 0) + 1; });
    return Object.entries(counts).map(([type, value]) => ({
      name: typeLabels[type] || type, value, color: typeColors[type] || "#8884d8", unit: "views",
    }));
  }, [filteredViews]);

  const hasTrafficData = filteredViews.length > 0;

  /* ══════════════════════════════════════════════════════════════
     REVENUE ANALYTICS (filtered by period)
     ══════════════════════════════════════════════════════════════ */
  const revenueRange = useMemo(
    () => getDateRange(revenuePeriod, revenueCustomStart, revenueCustomEnd),
    [revenuePeriod, revenueCustomStart, revenueCustomEnd]
  );

  const filteredPayments = useMemo(() => {
    return (payments ?? []).filter((p) => {
      const d = new Date(p.payment_date);
      return d >= revenueRange.start && d <= revenueRange.end;
    });
  }, [payments, revenueRange]);

  const totalRevenue = filteredPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalPayments = filteredPayments.length;
  const memberCount = filteredPayments.filter((p) => p.membership_tier === "member").length;
  const premierCount = filteredPayments.filter((p) => p.membership_tier === "premier_member").length;
  const membershipData = [
    { name: "Member", value: memberCount, color: "#6366f1", unit: "payments" },
    { name: "Premier", value: premierCount, color: "#f59e0b", unit: "payments" },
  ].filter((d) => d.value > 0);

  // Daily revenue chart
  const revenueDays = useMemo(() => getDaysBetween(revenueRange.start, revenueRange.end), [revenueRange]);
  const dailyRevenueData = useMemo(() => {
    return revenueDays.map(({ key, label }) => {
      const dayPayments = filteredPayments.filter((p) => p.payment_date?.startsWith(key));
      return {
        day: label,
        revenue: dayPayments.reduce((s, p) => s + Number(p.amount), 0),
        payments: dayPayments.length,
      };
    });
  }, [revenueDays, filteredPayments]);

  const avgRevenuePerDay = revenueDays.length > 0
    ? Math.round(totalRevenue / revenueDays.length)
    : 0;

  const hasRevenueData = filteredPayments.length > 0;

  /* ── Period label helper ──────────────────────────────────── */
  function periodLabel(period: Period, start: string, end: string): string {
    const range = getDateRange(period, start, end);
    const fmt = (d: Date) => d.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
    return `${fmt(range.start)} – ${fmt(range.end)}`;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/blog/new"><Plus className="mr-2 h-4 w-4" /> New Blog Post</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/articles/new"><Plus className="mr-2 h-4 w-4" /> New Article</Link>
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TRAFFIC SECTION
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Website Traffic
          </h2>
          <PeriodTabs
            period={trafficPeriod}
            setPeriod={setTrafficPeriod}
            customStart={trafficCustomStart}
            setCustomStart={setTrafficCustomStart}
            customEnd={trafficCustomEnd}
            setCustomEnd={setTrafficCustomEnd}
          />
        </div>
        <p className="font-body text-xs text-muted-foreground mb-4">
          {periodLabel(trafficPeriod, trafficCustomStart, trafficCustomEnd)}
        </p>

        {/* Traffic KPIs */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <Card className="border-l-4 border-l-violet-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
                <Eye className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Views</p>
                <p className="text-2xl font-headline font-bold text-foreground">{totalViews.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-cyan-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
                <Users className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-headline font-bold text-foreground">{uniqueVisitors.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-teal-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10">
                <Activity className="h-5 w-5 text-teal-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Today's Views</p>
                <p className="text-2xl font-headline font-bold text-foreground">{todayViews.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-pink-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/10">
                <MousePointerClick className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Avg Views/Day</p>
                <p className="text-2xl font-headline font-bold text-foreground">{avgViewsPerDay}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasTrafficData ? (
          <>
            <div className="grid gap-6 lg:grid-cols-3 mb-6">
              {/* Daily Views */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Daily Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={dailyViewsData}>
                      <defs>
                        <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(dailyViewsData.length / 8))} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="views" name="Views" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#viewsGrad)" dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Type Pie */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Views by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {pageTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={pageTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                          {pageTypeData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<PieTooltipComp />} />
                        <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="font-body text-xs text-muted-foreground">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">No data</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* All Pages Table */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">All Pages by Views</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-3 text-left font-body text-xs uppercase tracking-wider text-muted-foreground">#</th>
                        <th className="px-4 py-3 text-left font-body text-xs uppercase tracking-wider text-muted-foreground">Page</th>
                        <th className="px-4 py-3 text-left font-body text-xs uppercase tracking-wider text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-right font-body text-xs uppercase tracking-wider text-muted-foreground">Views</th>
                        <th className="px-4 py-3 text-right font-body text-xs uppercase tracking-wider text-muted-foreground">Unique</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPages.map((page, i) => (
                        <tr key={page.path} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-body text-xs text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-body text-sm font-medium text-foreground truncate max-w-[300px]">{page.title}</p>
                            <p className="font-body text-xs text-muted-foreground">{page.path}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              page.type === "article" ? "bg-emerald-100 text-emerald-700"
                              : page.type === "blog_post" ? "bg-amber-100 text-amber-700"
                              : page.type === "landing_post" ? "bg-pink-100 text-pink-700"
                              : "bg-indigo-100 text-indigo-700"
                            }`}>{typeLabels[page.type] || page.type}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-body font-semibold text-foreground">{page.views.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-body text-muted-foreground">{page.unique.toLocaleString()}</td>
                        </tr>
                      ))}
                      {topPages.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No page views in this period.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Top Articles & Blogs */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Top Articles</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {topArticles.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No article views in this period.</p>
                  ) : topArticles.map((a, i) => (
                    <div key={a.path} className="flex items-center justify-between rounded border border-border p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">{i + 1}</span>
                        <p className="font-body text-sm font-medium text-foreground truncate">{a.title}</p>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-3">
                        <Eye className="h-3 w-3" /><span className="font-body text-xs font-semibold">{a.views}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Top Blog Posts</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {topBlogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No blog views in this period.</p>
                  ) : topBlogs.map((b, i) => (
                    <div key={b.path} className="flex items-center justify-between rounded border border-border p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">{i + 1}</span>
                        <p className="font-body text-sm font-medium text-foreground truncate">{b.title}</p>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-3">
                        <Eye className="h-3 w-3" /><span className="font-body text-xs font-semibold">{b.views}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Eye className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-body text-sm text-muted-foreground mb-1">No traffic data for this period</p>
              <p className="font-body text-xs text-muted-foreground">Try selecting a different time range or wait for visitors.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          REVENUE SECTION
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Revenue & Analytics
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <PeriodTabs
              period={revenuePeriod}
              setPeriod={setRevenuePeriod}
              customStart={revenueCustomStart}
              setCustomStart={setRevenueCustomStart}
              customEnd={revenueCustomEnd}
              setCustomEnd={setRevenueCustomEnd}
            />
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/subscriptions"><CreditCard className="mr-2 h-3 w-3" /> Manage Payments</Link>
            </Button>
          </div>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-4">
          {periodLabel(revenuePeriod, revenueCustomStart, revenueCustomEnd)}
        </p>

        {/* Revenue KPIs */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10"><DollarSign className="h-5 w-5 text-indigo-500" /></div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-headline font-bold text-foreground">NPR {totalRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10"><Users className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-headline font-bold text-foreground">{totalPayments}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10"><BarChart3 className="h-5 w-5 text-emerald-500" /></div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Avg/Day</p>
                <p className="text-2xl font-headline font-bold text-foreground">NPR {avgRevenuePerDay.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-rose-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10"><TrendingUp className="h-5 w-5 text-rose-500" /></div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Premier Members</p>
                <p className="text-2xl font-headline font-bold text-foreground">{premierCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasRevenueData ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Membership Breakdown</CardTitle></CardHeader>
              <CardContent>
                {membershipData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={membershipData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {membershipData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                      </Pie>
                      <Tooltip content={<PieTooltipComp />} />
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(v: string) => <span className="font-body text-xs text-muted-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">No data</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Daily Payments</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dailyRevenueData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(dailyRevenueData.length / 8))} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="payments" name="Payments" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={dailyRevenueData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(dailyRevenueData.length / 8))} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-body text-sm text-muted-foreground mb-1">No payment data for this period</p>
              <p className="font-body text-xs text-muted-foreground mb-4">Try a different time range or add payments.</p>
              <Button asChild size="sm"><Link to="/admin/subscriptions"><Plus className="mr-2 h-3 w-3" /> Add Payment</Link></Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CONTENT STATS
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Articles</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Total</CardTitle></CardHeader><CardContent><p className="text-3xl font-headline font-bold">{articleStats?.total ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Published</CardTitle></CardHeader><CardContent><p className="text-3xl font-headline font-bold text-secondary">{articleStats?.published ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Drafts</CardTitle></CardHeader><CardContent><p className="text-3xl font-headline font-bold text-muted-foreground">{articleStats?.drafts ?? 0}</p></CardContent></Card>
        </div>
      </div>

      <div>
        <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Blog Posts</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Total</CardTitle></CardHeader><CardContent><p className="text-3xl font-headline font-bold">{blogStats?.total ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Published</CardTitle></CardHeader><CardContent><p className="text-3xl font-headline font-bold text-secondary">{blogStats?.published ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Drafts</CardTitle></CardHeader><CardContent><p className="text-3xl font-headline font-bold text-muted-foreground">{blogStats?.drafts ?? 0}</p></CardContent></Card>
        </div>
      </div>

      <div>
        <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Landing Page Posts</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Total</CardTitle></CardHeader><CardContent><p className="text-3xl font-headline font-bold">{landingStats?.total ?? 0}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Published</CardTitle></CardHeader><CardContent><p className="text-3xl font-headline font-bold text-secondary">{landingStats?.published ?? 0}</p></CardContent></Card>
          <Card className="border-dashed border-secondary/40"><CardContent className="flex items-center justify-center h-full py-6"><Link to="/admin/landing-posts" className="font-body text-sm text-secondary hover:underline font-semibold">Manage Landing Posts →</Link></CardContent></Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-headline text-lg">Recent Articles</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {recentArticles?.length === 0 && <p className="text-sm text-muted-foreground">No articles yet.</p>}
          {recentArticles?.map((article) => (
            <Link key={article.id} to={`/admin/articles/${article.id}`} className="flex items-center justify-between rounded border border-border p-3 transition-colors hover:bg-muted/50">
              <div><p className="font-body text-sm font-medium text-foreground">{article.title}</p><p className="font-body text-xs text-muted-foreground">{new Date(article.created_at).toLocaleDateString()}</p></div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${article.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{article.published ? "Published" : "Draft"}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-headline text-lg">Recent Blog Posts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {recentBlogs?.length === 0 && <p className="text-sm text-muted-foreground">No blog posts yet.</p>}
          {recentBlogs?.map((post) => (
            <Link key={post.id} to={`/admin/blog/${post.id}`} className="flex items-center justify-between rounded border border-border p-3 transition-colors hover:bg-muted/50">
              <div><p className="font-body text-sm font-medium text-foreground">{post.title}</p><p className="font-body text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p></div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${post.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{post.published ? "Published" : "Draft"}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-5">
        <Link to="/admin/articles" className="group"><Card className="transition-shadow hover:shadow-md"><CardContent className="flex items-center gap-3 p-5"><FileText className="h-5 w-5 text-secondary" /><span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Manage Articles</span></CardContent></Card></Link>
        <Link to="/admin/blog" className="group"><Card className="transition-shadow hover:shadow-md"><CardContent className="flex items-center gap-3 p-5"><BookImage className="h-5 w-5 text-secondary" /><span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Manage Blog</span></CardContent></Card></Link>
        <Link to="/admin/landing-posts" className="group"><Card className="transition-shadow hover:shadow-md border-secondary/30"><CardContent className="flex items-center gap-3 p-5"><LayoutDashboard className="h-5 w-5 text-secondary" /><span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Landing Posts</span></CardContent></Card></Link>
        <Link to="/admin/content" className="group"><Card className="transition-shadow hover:shadow-md"><CardContent className="flex items-center gap-3 p-5"><Globe className="h-5 w-5 text-secondary" /><span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Site Content</span></CardContent></Card></Link>
        <Link to="/admin/seo" className="group"><Card className="transition-shadow hover:shadow-md"><CardContent className="flex items-center gap-3 p-5"><Settings className="h-5 w-5 text-secondary" /><span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">SEO Settings</span></CardContent></Card></Link>
      </div>
    </div>
  );
}
