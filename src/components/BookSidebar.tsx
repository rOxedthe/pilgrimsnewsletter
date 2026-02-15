import { ExternalLink } from "lucide-react";
import bookCoverFallback from "@/assets/book-cover-1.jpg";
import { usePageContent } from "@/hooks/usePageContent";

export default function BookSidebar() {
  const { get } = usePageContent("/home");

  const bookImage = get("book_image") || bookCoverFallback;

  return (
    <aside className="space-y-6">
      <div className="border-b border-border pb-2">
        <h3 className="font-headline text-lg font-bold text-foreground">Recommended Reading</h3>
        <p className="font-body text-xs text-muted-foreground">Curated by Pilgrims Book House</p>
      </div>

      <div className="overflow-hidden rounded border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
        <div className="p-4 flex justify-center bg-cream-dark">
          <img
            src={bookImage}
            alt={get("book_title", "The Tibetan Book of Living and Dying")}
            className="h-48 w-auto object-contain book-tilt rounded"
          />
        </div>
        <div className="p-4 space-y-2">
          <h4 className="font-headline text-sm font-bold leading-snug text-foreground">
            {get("book_title", "The Tibetan Book of Living and Dying")}
          </h4>
          <p className="font-body text-xs text-muted-foreground">
            {get("book_author", "Sogyal Rinpoche")}
          </p>
          <p className="font-headline text-lg font-bold text-shop">
            {get("book_price", "$18.99")}
          </p>
          <a
            href={get("book_buy_link", "https://pilgrimsonline.com")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-shop py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-shop-foreground transition-all gold-glow hover:brightness-110"
          >
            Buy at PilgrimsOnline
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </aside>
  );
}
