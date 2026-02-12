import { ExternalLink } from "lucide-react";
import bookCover from "@/assets/book-cover-1.jpg";

const books = [
  {
    title: "The Tibetan Book of Living and Dying",
    author: "Sogyal Rinpoche",
    price: "$18.99",
    image: bookCover,
  },
];

export default function BookSidebar() {
  return (
    <aside className="space-y-6">
      <div className="border-b border-border pb-2">
        <h3 className="font-headline text-lg font-bold text-foreground">Recommended Reading</h3>
        <p className="font-body text-xs text-muted-foreground">Curated by Pilgrims Book House</p>
      </div>

      {books.map((book) => (
        <div
          key={book.title}
          className="overflow-hidden rounded border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
        >
          <div className="p-4 flex justify-center bg-cream-dark">
            <img
              src={book.image}
              alt={book.title}
              className="h-48 w-auto object-contain book-tilt rounded"
            />
          </div>
          <div className="p-4 space-y-2">
            <h4 className="font-headline text-sm font-bold leading-snug text-foreground">
              {book.title}
            </h4>
            <p className="font-body text-xs text-muted-foreground">{book.author}</p>
            <p className="font-headline text-lg font-bold text-shop">{book.price}</p>
            <a
              href="https://pilgrimsonline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-shop py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-shop-foreground transition-all gold-glow hover:brightness-110"
            >
              Buy at PilgrimsOnline
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </aside>
  );
}
