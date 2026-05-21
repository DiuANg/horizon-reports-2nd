import { Bookmark, ExternalLink, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { NewsArticle } from "@/types/news";
import { flagFor } from "@/utils/countryCodes";
import { timeAgo } from "@/utils/timeAgo";
import { Spinner } from "./LoadingState";

interface Props {
  country: { code: string; name: string };
  articles: NewsArticle[];
  loading: boolean;
  isBookmarked: (url: string) => boolean;
  onToggleBookmark: (a: NewsArticle) => void;
  onClose: () => void;
}

export function NewsPopup({ country, articles, loading, isBookmarked, onToggleBookmark, onClose }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-4">
      <div className="pointer-events-auto w-full max-w-md bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">{flagFor(country.code)}</span>
            <h2 className="font-semibold">{country.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <Spinner label="Fetching headlines..." />
          ) : articles.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No recent articles for this country.</p>
          ) : (
            <ul className="divide-y divide-border">
              {articles.slice(0, 5).map((a) => {
                const marked = isBookmarked(a.url);
                return (
                  <li key={a.id} className="p-4 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span className="text-primary font-medium truncate">{a.source}</span>
                          <span>·</span>
                          <span>{timeAgo(a.published)}</span>
                        </div>
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium leading-snug hover:text-primary inline-flex items-start gap-1"
                        >
                          {a.title}
                          <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                        </a>
                      </div>
                      <button
                        onClick={() => onToggleBookmark(a)}
                        aria-label="Bookmark"
                        className={`p-1.5 rounded-md transition-colors ${
                          marked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Bookmark className="w-4 h-4" fill={marked ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="px-5 py-3 border-t border-border bg-surface/50">
          <Link
            to="/top-news"
            search={{ country: country.code }}
            className="text-sm text-primary hover:underline"
          >
            View all from {country.name} →
          </Link>
        </div>
      </div>
    </div>
  );
}
