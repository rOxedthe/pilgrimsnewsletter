import { supabase } from "@/integrations/supabase/client";

/**
 * logAdminAction - Records admin activities for audit trail.
 *
 * Call this whenever an admin performs a significant action:
 *   - Creating/editing/deleting articles, blog posts, landing posts
 *   - Managing users or roles
 *   - Changing site settings
 *   - Adding/deleting payment records
 *
 * Usage:
 *   import { logAdminAction } from "@/lib/adminLogger";
 *   await logAdminAction("create_article", "article", articleId, { title: "My Article" });
 */
export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      admin_email: user.email ?? "unknown",
      action,
      target_type: targetType ?? null,
      target_id: targetId ?? null,
      details: details ? { ...details, timestamp: new Date().toISOString() } : null,
    });
  } catch (err) {
    // Never let logging break the app
    console.warn("Admin activity log failed:", err);
  }
}

/**
 * Common action names for consistency:
 *
 * Auth:
 *   admin_login, admin_logout, auto_logout_inactivity
 *
 * Articles:
 *   create_article, update_article, delete_article, publish_article, unpublish_article
 *
 * Blog Posts:
 *   create_blog_post, update_blog_post, delete_blog_post, publish_blog_post
 *
 * Landing Posts:
 *   create_landing_post, update_landing_post, delete_landing_post
 *
 * Users:
 *   update_user_role, delete_user
 *
 * Payments:
 *   create_payment, delete_payment
 *
 * Settings:
 *   update_seo_settings, update_page_content, update_banned_words
 */
