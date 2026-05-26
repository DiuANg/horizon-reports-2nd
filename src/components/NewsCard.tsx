import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NewsArticle } from "@/types/news";
import { timeAgo } from "@/utils/timeAgo";
import { truncate } from "@/utils/truncateText";
import { safeArticleUrl } from "@/utils/safeUrl";

interface Props {
  article: NewsArticle;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onDelete?: () => void;
}

export function NewsCard({ article, bookmarked, onToggleBookmark, onDelete }: Props) {
  const { t } = useTranslation();
  return (
    <article className="group bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(20,184,166,0.08)] hover:-translate-y-0.5 flex flex-col">
      <div className="relative aspect-[16/9] bg-surface-elevated overflow-hidden">
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs uppercase tracking-wider">
            {article.source}
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); onToggleBookmark(); }}
          aria-label={bookmarked ? t("bookmarks.removeBookmark") : t("bookmarks.addBookmark")}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-colors ${
            bookmarked ? "bg-primary text-primary-foreground" : "bg-black/40 text-white hover:bg-black/60"
          }`}
        >
          <Bookmark className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="text-primary font-medium">{article.source}</span>
          <span>·</span>
          <span>{timeAgo(article.published)}</span>
          {article.category?.[0] && (
            <>
              <span>·</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground/80 uppercase tracking-wide text-[10px]">{article.category[0]}</span>
            </>
          )}
        </div>
        <h3 className="text-base font-semibold leading-snug mb-2 line-clamp-3">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{truncate(article.description, 160)}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <a
            href={safeArticleUrl(article.url)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            {t("common.read")} <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t("common.remove")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
