import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/LoadingState";
import { NewsCard } from "@/components/NewsCard";
import { Bookmark, Lock } from "lucide-react";

export function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const bm = useBookmarks();
  const { t } = useTranslation();

  if (authLoading) return <div className="p-8"><Spinner /></div>;

  if (!user) {
    return (
      <div className="p-8 max-w-md mx-auto text-center mt-20">
        <Lock className="w-10 h-10 mx-auto mb-3 text-primary opacity-60" />
        <h1 className="text-xl font-bold mb-2">{t("auth.signInRequired")}</h1>
        <p className="text-sm text-muted-foreground mb-5">{t("auth.signInToManage")}</p>
        <Link to="/auth" className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          {t("auth.signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("bookmarks.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("bookmarks.savedCount", { count: bm.bookmarks.length })}</p>
        </div>
      </div>
      {bm.loading ? (
        <Spinner />
      ) : bm.bookmarks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{t("bookmarks.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bm.bookmarks.map((b) => (
            <NewsCard
              key={b.id}
              article={{
                id: b.id,
                title: b.title,
                url: b.article_url,
                source: b.source,
                country: b.country ?? undefined,
                language: b.language ?? undefined,
                image: b.image_url,
                published: b.created_at,
              }}
              bookmarked
              onToggleBookmark={() => bm.remove(b.article_url)}
              onDelete={() => bm.remove(b.article_url)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
