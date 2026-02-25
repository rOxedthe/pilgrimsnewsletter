
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LandingPost {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
  image_url: string | null;
  link_url: string | null;
  author_name: string | null;
  display_order: number;
  is_featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface UseLandingPostsOptions {
  featured?: boolean;
  limit?: number;
}

export function useLandingPosts(options: UseLandingPostsOptions = {}) {
  return useQuery({
    queryKey: ["landing-posts", options],
    queryFn: async () => {
      let query = supabase
        .from("landing_posts")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });

      if (options.featured !== undefined) {
        query = query.eq("is_featured", options.featured);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LandingPost[];
    },
  });
}
