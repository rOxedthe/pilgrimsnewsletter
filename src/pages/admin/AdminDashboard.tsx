import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  FileText, Globe, Settings, Plus, BookImage, LayoutDashboard,
  DollarSign, Users, TrendingUp, BarChart3, CreditCard,
  Eye, MousePointerClick, Activity, ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Area, AreaChart
} from "recharts";

/* ── Custom Tooltips ──────────────────────────────────────────── */

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="font-body text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="font-body text-xs" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" && entry.name.toLowerCase().includes("revenue")
            ? `NPR ${entry.value.toLocaleString()}`
            : entry.value}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="font-body text-xs font-semibold" style={{ color: payload[0].payload.color }}>
        {payload[0].name}: {payload[0].value} {payload[0].payload.unit ?? ""}
      </p>
    </div>
  );
};

/* ── Helpers ───────────────────────────────────────────────────── */

function getLast6Months(): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    months.push({ key, label });
  }
  return months;
}

function getLast14Days(): { key: string; label: string }[] {
  const days: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("default", { month: "short", day: "numeric" });
    days.push({ key, label });
  }
  return days;
}

/* ── Component ────────────────────────────────────────────────── */

export default function AdminDashboard() {
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
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, published, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: recentBlogs } = useQuery({
    queryKey: ["admin-recent-blogs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, published, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  /* ── Subscription / Revenue query ─────────────────────────── */
  const { data: payments } = useQuery({
    queryKey: ["admin-subscription-payments-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_payments")
        .select("*")
        .order("payment_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  /* ── Page Views / Traffic query ───────────────────────────── */
  const { data: pageViews } = useQuery({
    queryKey: ["admin-page-views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  /* ══════════════════════════════════════════════════════════════
     COMPUTE REVENUE ANALYTICS
     ══════════════════════════════════════════════════════════════ */
  const allPayments = payments ?? [];
  const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPayments = allPayments.length;

  const memberCount = allPayments.filter((p) => p.membership_tier === "member").length;
  const premierCount = allPayments.filter((p) => p.membership_tier === "premier_member").length;
  const membershipData = [
    { name: "Member", value: memberCount, color: "#6366f1", unit: "payments" },
    { name: "Premier", value: premierCount, color: "#f59e0b", unit: "payments" },
  ].filter((d) => d.value > 0);

  const last6 = getLast6Months();
  const monthlyRevData = last6.map(({ key, label }) => {
    const mp = allPayments.filter((p) => {
      const d = new Date(p.payment_date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === key;
    });
    return { month: label, revenue: mp.reduce((s, p) => s + Number(p.amount), 0), newSubs: mp.length };
  });

  const curMonthRev = monthlyRevData[monthlyRevData.length - 1]?.revenue ?? 0;
  const prevMonthRev = monthlyRevData[monthlyRevData.length - 2]?.revenue ?? 0;
  const growthPercent = prevMonthRev > 0
    ? (((curMonthRev - prevMonthRev) / prevMonthRev) * 100).toFixed(1)
    : "0.0";
  const avgRevenue = monthlyRevData.filter((m) => m.revenue > 0).length > 0
    ? Math.round(totalRevenue / monthlyRevData.filter((m) => m.revenue > 0).length)
    : 0;
  const hasRevenueData = allPayments.length > 0;

  /* ══════════════════════════════════════════════════════════════
     COMPUTE TRAFFIC ANALYTICS
     ══════════════════════════════════════════════════════════════ */
  const allViews = pageViews ?? [];
  const totalViews = allViews.length;
  const uniqueVisitors = new Set(allViews.map((v) => v.visitor_id)).size;

  // Today's views
  const today = new Date().toISOString().split("T")[0];
  const todayViews = allViews.filter((v) => v.created_at?.startsWith(today)).length;

  // Views per day (last 14 days)
  const last14 = getLast14Days();
  const dailyViewsData = last14.map(({ key, label }) => {
    const count = allViews.filter((v) => v.created_at?.startsWith(key)).length;
    return { day: label, views: count };
  });

  // Top articles by views
  const articleViews: Record<string, { path: string; title: string; views: number }> = {};
  allViews
    .filter((v) => v.page_type === "article")
    .forEach((v) => {
      const key = v.page_path;
      if (!articleViews[key]) {
        articleViews[key] = { path: key, title: v.page_title || key, views: 0 };
      }
      articleViews[key].views++;
    });
  const topArticles = Object.values(articleViews)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Top blog posts by views
  const blogViews: Record<string, { path: string; title: string; views: number }> = {};
  allViews
    .filter((v) => v.page_type === "blog_post")
    .forEach((v) => {
      const key = v.page_path;
      if (!blogViews[key]) {
        blogViews[key] = { path: key, title: v.page_title || key, views: 0 };
      }
      blogViews[key].views++;
    });
  const topBlogs = Object.values(blogViews)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // All pages ranked by views
  const allPageViews: Record<string, { path: string; title: string; type: string; views: number; uniqueVisitors: Set<string> }> = {};
  allViews.forEach((v) => {
    const key = v.page_path;
    if (!allPageViews[key]) {
      allPageViews[key] = { path: key, title: v.page_title || key, type: v.page_type || "page", views: 0, uniqueVisitors: new Set() };
    }
    allPageViews[key].views++;
    allPageViews[key].uniqueVisitors.add(v.visitor_id);
  });
  const topPages = Object.values(allPageViews)
    .map((p) => ({ ...p, unique: p.uniqueVisitors.size }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const hasTrafficData = allViews.length > 0;

  /* ── Page type distribution for pie chart ─────────────────── */
  const pageTypeCount: Record<string, number> = {};
  allViews.forEach((v) => {
    const t = v.page_type || "page";
    pageTypeCount[t] = (pageTypeCount[t] || 0) + 1;
  });
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
  const pageTypeData = Object.entries(pageTypeCount).map(([type, value]) => ({
    name: typeLabels[type] || type,
    value,
    color: typeColors[type] || "#8884d8",
    unit: "views",
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/blog/new">
              <Plus className="mr-2 h-4 w-4" /> New Blog Post
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/articles/new">
              <Plus className="mr-2 h-4 w-4" /> New Article
            </Link>
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TRAFFIC ANALYTICS SECTION
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Website Traffic
        </h2>

        {/* Traffic KPI Cards */}
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
                <p className="text-2xl font-headline font-bold text-foreground">
                  {dailyViewsData.length > 0
                    ? Math.round(dailyViewsData.reduce((s, d) => s + d.views, 0) / dailyViewsData.length)
                    : 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasTrafficData ? (
          <>
            {/* Traffic Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3 mb-6">
              {/* Daily Views Trend */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">
                    Daily Views (Last 14 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={dailyViewsData}>
                      <defs>
                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="views"
                        name="Views"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fill="url(#viewsGradient)"
                        dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Page Type Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">
                    Views by Content Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pageTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={pageTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {pageTypeData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          iconSize={8}
                          formatter={(value: string) => (
                            <span className="font-body text-xs text-muted-foreground">{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
                      No data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Pages Table */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">
                  All Pages by Views
                </CardTitle>
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
                            <p className="font-body text-sm font-medium text-foreground truncate max-w-[300px]">
                              {page.title}
                            </p>
                            <p className="font-body text-xs text-muted-foreground">{page.path}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                page.type === "article"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : page.type === "blog_post"
                                  ? "bg-amber-100 text-amber-700"
                                  : page.type === "landing_post"
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-indigo-100 text-indigo-700"
                              }`}
                            >
                              {typeLabels[page.type] || page.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-body font-semibold text-foreground">
                            {page.views.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-body text-muted-foreground">
                            {page.unique.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {topPages.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                            No page views recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Top Articles & Blogs side by side */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Articles */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">
                    Top Articles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topArticles.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No article views yet.</p>
                  ) : (
                    topArticles.map((a, i) => (
                      <div key={a.path} className="flex items-center justify-between rounded border border-border p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <p className="font-body text-sm font-medium text-foreground truncate">{a.title}</p>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-3">
                          <Eye className="h-3 w-3" />
                          <span className="font-body text-xs font-semibold">{a.views}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Top Blog Posts */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">
                    Top Blog Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topBlogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No blog views yet.</p>
                  ) : (
                    topBlogs.map((b, i) => (
                      <div key={b.path} className="flex items-center justify-between rounded border border-border p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <p className="font-body text-sm font-medium text-foreground truncate">{b.title}</p>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-3">
                          <Eye className="h-3 w-3" />
                          <span className="font-body text-xs font-semibold">{b.views}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Eye className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-body text-sm text-muted-foreground mb-1">No traffic data yet</p>
              <p className="font-body text-xs text-muted-foreground">
                Traffic will appear here once visitors start browsing your site.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          REVENUE & ANALYTICS SECTION
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Revenue & Analytics
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/subscriptions">
              <CreditCard className="mr-2 h-3 w-3" /> Manage Payments
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                <DollarSign className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-headline font-bold text-foreground">NPR {totalRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-headline font-bold text-foreground">{totalPayments}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Avg Monthly</p>
                <p className="text-2xl font-headline font-bold text-foreground">NPR {avgRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-rose-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10">
                <TrendingUp className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Monthly Growth</p>
                <p className="text-2xl font-headline font-bold text-foreground">
                  {Number(growthPercent) >= 0 ? "+" : ""}{growthPercent}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasRevenueData ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Membership Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {membershipData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={membershipData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {membershipData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(value: string) => (<span className="font-body text-xs text-muted-foreground">{value}</span>)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm font-body">No data yet</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Monthly Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyRevData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="newSubs" name="Payments" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthlyRevData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGradient)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-body text-sm text-muted-foreground mb-1">No payment data yet</p>
              <p className="font-body text-xs text-muted-foreground mb-4">Start recording subscription payments to see your analytics here.</p>
              <Button asChild size="sm"><Link to="/admin/subscriptions"><Plus className="mr-2 h-3 w-3" /> Add First Payment</Link></Button>
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
