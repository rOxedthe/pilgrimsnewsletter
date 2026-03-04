/**
 * Input Sanitization Utilities
 *
 * Use these functions to sanitize any user input before storing or rendering.
 * This prevents XSS (Cross-Site Scripting) attacks.
 *
 * Usage:
 *   import { sanitizeText, sanitizeHtml, sanitizeEmail } from "@/lib/sanitize";
 *   const clean = sanitizeText(userInput);
 */

/**
 * Escapes HTML special characters to prevent XSS injection.
 * Use this for plain text fields like names, titles, etc.
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Strips all HTML tags from input. Use for fields that should never contain HTML.
 */
export function stripHtml(input: string): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitizes HTML content by removing dangerous tags and attributes.
 * Allows basic formatting tags. Use for rich text content like article bodies.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  // Remove script tags and their contents
  let clean = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers (onclick, onerror, onload, etc.)
  clean = clean.replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");

  // Remove javascript: protocol
  clean = clean.replace(/javascript\s*:/gi, "");

  // Remove data: protocol in src/href (can be used for XSS)
  clean = clean.replace(/data\s*:[^,]*,/gi, "");

  // Remove vbscript: protocol
  clean = clean.replace(/vbscript\s*:/gi, "");

  // Remove style tags (can contain expressions)
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove iframe, object, embed, form tags
  clean = clean.replace(/<(iframe|object|embed|form|base|meta|link)\b[^>]*>/gi, "");
  clean = clean.replace(/<\/(iframe|object|embed|form|base|meta|link)>/gi, "");

  return clean.trim();
}

/**
 * Sanitizes and validates email addresses.
 */
export function sanitizeEmail(input: string): string {
  if (!input) return "";
  const trimmed = input.toLowerCase().trim();
  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed) ? trimmed : "";
}

/**
 * Sanitizes URL inputs to prevent javascript: and data: injection.
 */
export function sanitizeUrl(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // Only allow http, https, mailto, and tel protocols
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("/") // relative URLs
  ) {
    return trimmed;
  }

  // If no protocol, assume https
  if (!trimmed.includes("://")) {
    return `https://${trimmed}`;
  }

  // Block everything else (javascript:, data:, vbscript:, etc.)
  return "";
}

/**
 * Sanitizes a slug (URL-safe string).
 */
export function sanitizeSlug(input: string): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Sanitizes numeric input - returns number or null.
 */
export function sanitizeNumber(input: string | number): number | null {
  if (input === "" || input === null || input === undefined) return null;
  const num = typeof input === "string" ? parseFloat(input) : input;
  return isNaN(num) ? null : num;
}

/**
 * General purpose sanitizer that handles common cases.
 * Removes null bytes, control characters, and trims whitespace.
 */
export function sanitizeGeneral(input: string): string {
  if (!input) return "";
  return input
    .replace(/\0/g, "") // null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // control chars (keep \t, \n, \r)
    .trim();
}
