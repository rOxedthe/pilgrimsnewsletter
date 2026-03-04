import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  FileText, Globe, Settings, Plus, BookImage, LayoutDashboard,
  DollarSign, Users, TrendingUp, BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from "recharts";

/* ── Sample Analytics Data ────────────────────────────────────── */

const membershipData = [
  { name: "Member", value: 482, color: "#6366f1" },
  { name: "Premier Member", value: 164, color: "#f59e0b" },
];

const monthlySubscriptions = [
  { month: "Sep", newSubs: 32, cancelled: 8 },
  { month: "Oct", newSubs: 45, cancelled: 12 },
  { month: "Nov", newSubs: 58, cancelled: 10 },
  { month: "Dec", newSubs: 41, cancelled: 15 },
  { month: "Jan", newSubs: 63, cancelled: 9 },
  { month: "Feb", newSubs: 72, cancelled: 11 },
];

const revenueData = [
  { month: "Sep", revenue: 2840 },
  { month: "Oct", revenue: 3620 },
  { month: "Nov", revenue: 4510 },
  { month: "Dec", revenue: 3980 },
  { month: "Jan", revenue: 5240 },
  { month: "Feb", revenue: 6130 },
];

const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
const totalMembers = membershipData.reduce((sum, d) => sum + d.value, 0);
const avgRevenue = Math.round(totalRevenue / revenueData.length);
const growthPercent = (
  ((revenueData[revenueData.length - 1].revenue - revenueData[revenueData.length - 2].revenue) /
    revenueData[revenueData.length - 2].revenue) *
  100
).toFixed(1);

/* ── Custom Tooltip ───────────────────────────────────────────── */

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="font-body text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="font-body text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.name.toLowerCase().includes("revenue") ? `$${entry.value.toLocaleString()}` : entry.value}
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
        {payload[0].name}: {payload[0].value} members
      </p>
    </div>
  );
};

/* ── Component ────────────────────────────────────────────────── */

export default function AdminDashboard() {
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
          ANALYTICS & REVENUE SECTION
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Revenue & Analytics
        </h2>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                <DollarSign className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-headline font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total Members</p>
                <p className="text-2xl font-headline font-bold text-foreground">{totalMembers.toLocaleString()}</p>
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
                <p className="text-2xl font-headline font-bold text-foreground">${avgRevenue.toLocaleString()}</p>
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
                <p className="text-2xl font-headline font-bold text-foreground">+{growthPercent}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pie Chart - Membership Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">
                Membership Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {membershipData.map((entry, index) => (
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
            </CardContent>
          </Card>

          {/* Bar Chart - Monthly Subscriptions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">
                Monthly Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlySubscriptions} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="newSubs" name="New Subs" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Area/Line Chart - Revenue Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-body text-sm uppercase tracking-wider text-muted-foreground">
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <p className="mt-3 font-body text-xs text-muted-foreground italic">
          * Currently showing sample data. Connect your payment provider to display real revenue metrics.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          EXISTING SECTIONS BELOW
          ═══════════════════════════════════════════════════════════ */}

      {/* Article Stats */}
      <div>
        <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Articles</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Total</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-headline font-bold">{articleStats?.total ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Published</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-headline font-bold text-secondary">{articleStats?.published ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Drafts</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-headline font-bold text-muted-foreground">{articleStats?.drafts ?? 0}</p></CardContent>
          </Card>
        </div>
      </div>

      {/* Blog Stats */}
      <div>
        <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Blog Posts</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Total</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-headline font-bold">{blogStats?.total ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Published</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-headline font-bold text-secondary">{blogStats?.published ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Drafts</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-headline font-bold text-muted-foreground">{blogStats?.drafts ?? 0}</p></CardContent>
          </Card>
        </div>
      </div>

      {/* Landing Posts Stats */}
      <div>
        <h2 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Landing Page Posts</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Total</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-headline font-bold">{landingStats?.total ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-body uppercase tracking-wider text-muted-foreground">Published</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-headline font-bold text-secondary">{landingStats?.published ?? 0}</p></CardContent>
          </Card>
          <Card className="border-dashed border-secondary/40">
            <CardContent className="flex items-center justify-center h-full py-6">
              <Link to="/admin/landing-posts" className="font-body text-sm text-secondary hover:underline font-semibold">
                Manage Landing Posts →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Recent Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentArticles?.length === 0 && <p className="text-sm text-muted-foreground">No articles yet.</p>}
          {recentArticles?.map((article) => (
            <Link
              key={article.id}
              to={`/admin/articles/${article.id}`}
              className="flex items-center justify-between rounded border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="font-body text-sm font-medium text-foreground">{article.title}</p>
                <p className="font-body text-xs text-muted-foreground">{new Date(article.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${article.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {article.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Recent Blog Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Recent Blog Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentBlogs?.length === 0 && <p className="text-sm text-muted-foreground">No blog posts yet.</p>}
          {recentBlogs?.map((post) => (
            <Link
              key={post.id}
              to={`/admin/blog/${post.id}`}
              className="flex items-center justify-between rounded border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="font-body text-sm font-medium text-foreground">{post.title}</p>
                <p className="font-body text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${post.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {post.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Link to="/admin/articles" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <FileText className="h-5 w-5 text-secondary" />
              <span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Manage Articles</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/blog" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <BookImage className="h-5 w-5 text-secondary" />
              <span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Manage Blog</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/landing-posts" className="group">
          <Card className="transition-shadow hover:shadow-md border-secondary/30">
            <CardContent className="flex items-center gap-3 p-5">
              <LayoutDashboard className="h-5 w-5 text-secondary" />
              <span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Landing Posts</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/content" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <Globe className="h-5 w-5 text-secondary" />
              <span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">Site Content</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/seo" className="group">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <Settings className="h-5 w-5 text-secondary" />
              <span className="font-body text-sm font-medium text-foreground group-hover:text-secondary">SEO Settings</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
