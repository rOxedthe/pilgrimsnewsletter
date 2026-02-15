import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ContentItem {
  id: string;
  page_path: string;
  section_key: string;
  content_value: string;
}

export function usePageContent(pagePath: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["page-content", pagePath],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_path", pagePath);
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const get = (key: string, fallback = "") => {
    const item = data?.find((c) => c.section_key === key);
    return item?.content_value || fallback;
  };

  return { get, isLoading, data };
}

export function useMultiPageContent(pagePaths: string[]) {
  const { data, isLoading } = useQuery({
    queryKey: ["page-content", ...pagePaths],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .in("page_path", pagePaths);
      if (error) throw error;
      return data as ContentItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const get = (pagePath: string, key: string, fallback = "") => {
    const item = data?.find((c) => c.page_path === pagePath && c.section_key === key);
    return item?.content_value || fallback;
  };

  return { get, isLoading, data };
}
