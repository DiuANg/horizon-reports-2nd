import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { NewsArticle } from "@/types/news";

export interface Bookmark {
  id: string;
  article_url: string;
  title: string;
  source: string;
  country: string | null;
  language: string | null;
  image_url: string | null;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const userId = user?.id;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) { setBookmarks([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("bookmarks")
      .select("id, article_url, title, source, country, language, image_url, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setBookmarks((data ?? []) as Bookmark[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const isBookmarked = useCallback(
    (url: string) => bookmarks.some((b) => b.article_url === url),
    [bookmarks]
  );

  const requireAuth = () => {
    if (!userId) {
      toast.error(t("bookmarks.toastSignInToSave"));
      return false;
    }
    return true;
  };

  const add = useCallback(
    async (a: NewsArticle) => {
      if (!requireAuth()) return;
      await supabase.from("bookmarks").insert({
        user_id: userId!,
        article_url: a.url,
        title: a.title,
        source: a.source,
        country: a.country ?? null,
        language: a.language ?? null,
        image_url: a.image ?? null,
      });
      await refresh();
    },
    [userId, refresh]
  );

  const remove = useCallback(
    async (url: string) => {
      if (!userId) return;
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("article_url", url);
      await refresh();
    },
    [userId, refresh]
  );

  const toggle = useCallback(
    async (a: NewsArticle) => {
      if (isBookmarked(a.url)) await remove(a.url);
      else await add(a);
    },
    [isBookmarked, add, remove]
  );

  const clearAll = useCallback(async () => {
    if (!userId) return;
    await supabase.from("bookmarks").delete().eq("user_id", userId);
    await refresh();
  }, [userId, refresh]);

  return { bookmarks, loading, isBookmarked, add, remove, toggle, clearAll, refresh, isAuthed: !!userId };
}
