/**
 * Content moderation — banned word filter.
 * Add or remove words from BANNED_WORDS to adjust the filter.
 * Matching is case-insensitive and checks for whole-word boundaries
 * so "class" won't flag "classic".
 */

const BANNED_WORDS: string[] = [
  // Profanity
  "fuck", "shit", "ass", "bitch", "damn", "crap", "dick", "piss",
  "bastard", "slut", "whore", "cunt",
  // Slurs (abbreviated to avoid displaying them fully)
  "nigger", "nigga", "faggot", "retard", "retarded",
  // Hate speech
  "nazi", "holocaust denial",
  // Spam patterns
  "buy now", "click here", "free money", "make money fast",
  // Violence
  "kill yourself", "kys",
];

// Build regex patterns once for performance
const patterns = BANNED_WORDS.map(
  (word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
);

export interface FilterResult {
  clean: boolean;
  matched: string[];
}

/**
 * Check text content against the banned words list.
 * For HTML content, strips tags before checking.
 */
export function checkContent(text: string): FilterResult {
  // Strip HTML tags for checking rich-text content
  const plain = text.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ");
  const matched: string[] = [];

  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(plain)) {
      matched.push(BANNED_WORDS[i]);
    }
  }

  return { clean: matched.length === 0, matched };
}

/**
 * Returns a user-friendly error message if banned words are found.
 */
export function getFilterError(text: string): string | null {
  const result = checkContent(text);
  if (result.clean) return null;
  return `Content contains prohibited language. Please remove inappropriate words and try again.`;
}
