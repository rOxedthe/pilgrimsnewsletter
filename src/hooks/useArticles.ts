import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArticleWithAuthor {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string | null;
  category: string;
  image_url: string | null;
  read_time: string | null;
  featured: boolean;
  created_at: string;
  author: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
    bio: string | null;
  } | null;
}

export function useArticles(options?: { featured?: boolean; category?: string; limit?: number }) {
  return useQuery({
    queryKey: ["articles", options],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select(`
          id, slug, title, excerpt, content, category, image_url, read_time, featured, created_at,
          author:profiles!author_id (display_name, avatar_url, username, bio)
        `)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (options?.featured) query = query.eq("featured", true);
      if (options?.category && options.category !== "All") query = query.eq("category", options.category);
      if (options?.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as ArticleWithAuthor[]) ?? [];
    },
  });
}

export function useArticleBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id, slug, title, excerpt, content, category, image_url, read_time, featured, created_at,
          author:profiles!author_id (display_name, avatar_url, username, bio)
        `)
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ArticleWithAuthor | null;
    },
    enabled: !!slug,
  });
}
