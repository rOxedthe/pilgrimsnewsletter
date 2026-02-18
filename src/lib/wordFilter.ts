/**
 * Content moderation — banned word filter.
 * Reads banned words from the database (banned_words table).
 * Falls back to an empty list if the fetch fails.
 * Matching is case-insensitive and checks for whole-word boundaries
 * so "class" won't flag "classic".
 */

import { supabase } from "@/integrations/supabase/client";

let cachedWords: string[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

async function getBannedWords(): Promise<string[]> {
  const now = Date.now();
  if (cachedWords && now - cacheTime < CACHE_TTL) return cachedWords;

  const { data, error } = await supabase
    .from("banned_words")
    .select("word");

  if (error) {
    console.error("Failed to fetch banned words:", error.message);
    return cachedWords ?? [];
  }

  cachedWords = data.map((d) => d.word);
  cacheTime = now;
  return cachedWords;
}

function buildPatterns(words: string[]): RegExp[] {
  return words.map(
    (word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
  );
}

export interface FilterResult {
  clean: boolean;
  matched: string[];
}

/**
 * Check text content against the banned words list.
 * For HTML content, strips tags before checking.
 */
export async function checkContent(text: string): Promise<FilterResult> {
  const words = await getBannedWords();
  const patterns = buildPatterns(words);
  const plain = text.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ");
  const matched: string[] = [];

  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(plain)) {
      matched.push(words[i]);
    }
  }

  return { clean: matched.length === 0, matched };
}

/**
 * Returns a user-friendly error message if banned words are found.
 */
export async function getFilterError(text: string): Promise<string | null> {
  const result = await checkContent(text);
  if (result.clean) return null;
  return `Content contains prohibited language. Please remove inappropriate words and try again.`;
}

/** Invalidate the cache so next check fetches fresh data */
export function invalidateBannedWordsCache() {
  cachedWords = null;
  cacheTime = 0;
}
