import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string | null;
  cover_image: string | null;
  gallery_images: string[];
  category: string;
  published_at: string | null;
  created_at: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {isLoading ? (
        <div className="container py-24">
          <div className="max-w-3xl mx-auto animate-pulse space-y-6">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      ) : !post ? (
        <div className="container py-24 text-center">
          <h1 className="font-headline text-3xl font-bold text-foreground">Post not found</h1>
          <p className="font-body text-muted-foreground mt-2">The blog post you're looking for doesn't exist.</p>
        </div>
      ) : (
        <div className="container max-w-3xl py-12 lg:py-20">
          <Link to="/blogs" className="inline-flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          <span className="inline-block font-body text-xs font-semibold uppercase tracking-widest text-secondary mb-3">
            {post.category}
          </span>

          <h1 className="font-headline text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl text-balance mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Calendar className="h-4 w-4" />
            {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </div>

          {post.cover_image && (
            <div className="mb-10 overflow-hidden rounded-lg">
              <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          {post.content && (
            <div
              className="prose prose-lg max-w-none font-body text-foreground/90"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {post.gallery_images && post.gallery_images.length > 0 && (
            <div className="mt-12 space-y-4">
              <h3 className="font-headline text-lg font-bold text-foreground">Gallery</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {post.gallery_images.map((img, i) => (
                  <div key={i} className="overflow-hidden rounded-lg">
                    <img src={img} alt={`Gallery ${i + 1}`} className="w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <FooterSection />
    </div>
  );
}
