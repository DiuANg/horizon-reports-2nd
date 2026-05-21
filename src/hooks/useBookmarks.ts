import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { NewsArticle } from "@/types/news";

const SESSION_KEY = "wn_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

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
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const sessionId = typeof window !== "undefined" ? getSessionId() : "ssr";

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookmarks")
      .select("id, article_url, title, source, country, language, image_url, created_at")
      .eq("user_session_id", sessionId)
      .order("created_at", { ascending: false });
    setBookmarks((data ?? []) as Bookmark[]);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => { refresh(); }, [refresh]);

  const isBookmarked = useCallback(
    (url: string) => bookmarks.some((b) => b.article_url === url),
    [bookmarks]
  );

  const add = useCallback(
    async (a: NewsArticle) => {
      await supabase.from("bookmarks").insert({
        user_session_id: sessionId,
        article_url: a.url,
        title: a.title,
        source: a.source,
        country: a.country ?? null,
        language: a.language ?? null,
        image_url: a.image ?? null,
      });
      await refresh();
    },
    [sessionId, refresh]
  );

  const remove = useCallback(
    async (url: string) => {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_session_id", sessionId)
        .eq("article_url", url);
      await refresh();
    },
    [sessionId, refresh]
  );

  const toggle = useCallback(
    async (a: NewsArticle) => {
      if (isBookmarked(a.url)) await remove(a.url);
      else await add(a);
    },
    [isBookmarked, add, remove]
  );

  const clearAll = useCallback(async () => {
    await supabase.from("bookmarks").delete().eq("user_session_id", sessionId);
    await refresh();
  }, [sessionId, refresh]);

  return { bookmarks, loading, isBookmarked, add, remove, toggle, clearAll, refresh, sessionId };
}
