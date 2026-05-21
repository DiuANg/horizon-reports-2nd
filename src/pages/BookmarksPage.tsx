import { useBookmarks } from "@/hooks/useBookmarks";
import { Spinner } from "@/components/LoadingState";
import { NewsCard } from "@/components/NewsCard";
import { Bookmark } from "lucide-react";

export function BookmarksPage() {
  const bm = useBookmarks();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bookmarks</h1>
          <p className="text-sm text-muted-foreground mt-1">{bm.bookmarks.length} saved articles</p>
        </div>
      </div>
      {bm.loading ? (
        <Spinner />
      ) : bm.bookmarks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No bookmarks yet. Save articles from the globe, top news, or search.</p>
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
