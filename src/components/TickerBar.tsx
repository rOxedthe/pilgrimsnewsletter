const items = [
  "📖 Just Added: 'The Snow Leopard' – First Edition",
  "🔔 Rare Find: Nepali Palm Leaf Manuscripts",
  "📚 New Arrival: 'Siddhartha' – Illustrated Collector's Edition",
  "✨ Staff Pick: 'In Praise of Shadows' by Jun'ichirō Tanizaki",
  "🏔️ Himalayan Maps Collection – 19th Century Reprints",
];

export default function TickerBar() {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-border bg-primary py-2">
      <div className="ticker-scroll flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="mx-8 font-body text-sm text-primary-foreground/90 tracking-wide"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
