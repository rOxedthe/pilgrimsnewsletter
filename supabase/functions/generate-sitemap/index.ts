import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Get published site URL from request or fallback
  const { siteUrl = "https://pilgrimsnewsletter.lovable.app" } = await req.json().catch(() => ({}));

  // Fetch all page SEO entries
  const { data: pages } = await supabase.from("page_seo").select("page_path, no_index, updated_at");

  // Fetch all published article slugs
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, updated_at")
    .eq("published", true);

  const urls: string[] = [];

  // Static pages
  for (const page of pages ?? []) {
    if (page.no_index) continue;
    urls.push(`  <url>
    <loc>${siteUrl}${page.page_path === "/" ? "" : page.page_path}</loc>
    <lastmod>${new Date(page.updated_at).toISOString().split("T")[0]}</lastmod>
    <priority>${page.page_path === "/" ? "1.0" : "0.8"}</priority>
  </url>`);
  }

  // Article pages
  for (const article of articles ?? []) {
    urls.push(`  <url>
    <loc>${siteUrl}/article/${article.slug}</loc>
    <lastmod>${new Date(article.updated_at).toISOString().split("T")[0]}</lastmod>
    <priority>0.6</priority>
  </url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(JSON.stringify({ sitemap, urlCount: urls.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
