import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

interface Props {
  articlesLeft?: number;
}

export default function StickyPaywallBanner({ articlesLeft = 1 }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-secondary/30 bg-foreground/95 backdrop-blur-sm">
      <div className="container flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3">
          <Lock className="h-4 w-4 text-secondary" />
          <p className="font-body text-sm text-primary-foreground/80">
            You have <span className="font-bold text-secondary">{articlesLeft} free article{articlesLeft !== 1 ? 's' : ''}</span> left this month.
          </p>
        </div>
        <Link
          to="/subscribe"
          className="shrink-0 rounded bg-primary px-5 py-2 font-body text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-125"
        >
          Join the Inner Circle
        </Link>
      </div>
    </div>
  );
}
