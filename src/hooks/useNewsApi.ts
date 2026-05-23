import { useCallback, useEffect, useRef, useState } from "react";
import { filterMock, filterMockPage } from "@/data/mockNews";
import type { NewsArticle } from "@/types/news";
import { useApiKey, getEnvApiKey } from "@/hooks/useApiKey";
import { supabase } from "@/integrations/supabase/client";
import { fetchNewsServer } from "@/lib/news.functions";
import { MOCK_NEWS } from "@/data/mockNews";

export type { ApiKeyStatus } from "@/hooks/useApiKey";

interface FetchOpts {
  country?: string;
  language?: string;
  category?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
}

interface CurrentsNewsItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  author?: string;
  image?: string | null;
  language?: string;
  category?: string[];
  published: string;
}

function startOfDayUtc(date: string): string {
  return `${date}T00:00:00.000+00:00`;
}

function endOfDayUtc(date: string): string {
  return `${date}T23:59:59.000+00:00`;
}

async function fetchFromCurrents(key: string, opts: FetchOpts & { page?: number }): Promise<NewsArticle[]> {
  const params = new URLSearchParams();
  if (opts.country) params.set("country", opts.country);
  if (opts.language) params.set("language", opts.language);
  if (opts.category) params.set("category", opts.category);
  if (opts.startDate) params.set("start_date", startOfDayUtc(opts.startDate));
  if (opts.endDate) params.set("end_date", endOfDayUtc(opts.endDate));
  if (opts.page && opts.page > 1) params.set("page_number", String(opts.page));
  const hasDates = !!(opts.startDate || opts.endDate);
  const useSearch = !!opts.query || hasDates;
  if (useSearch) params.set("keywords", opts.query?.trim() || "news");
  const endpoint = useSearch
    ? `https://api.currentsapi.services/v2/search?${params}`
    : `https://api.currentsapi.services/v2/latest-news?${params}`;
  const res = await fetch(endpoint, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Currents API error ${res.status}`);
  const json = await res.json();
  const items = (json.news ?? []) as CurrentsNewsItem[];
  return items.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    url: n.url,
    author: n.author,
    image: n.image && n.image !== "None" ? n.image : null,
    language: n.language,
    category: n.category,
    published: n.published,
    source: (() => {
      try {
        return new URL(n.url).hostname.replace(/^www\./, "");
      } catch {
        return n.author ?? "Unknown";
      }
    })(),
    country: opts.country,
  }));
}

function dedupe(existing: NewsArticle[], incoming: NewsArticle[]): NewsArticle[] {
  const seen = new Set(existing.map((a) => a.id));
  return [...existing, ...incoming.filter((a) => !seen.has(a.id))];
}

export function useNewsApi(opts: FetchOpts) {
  const { country, language, category, query, startDate, endDate } = opts;
  const { key, status, loading: keyLoading } = useApiKey();
  const [data, setData] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [effectiveStatus, setEffectiveStatus] = useState(status);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  // Track the current request so out-of-order responses don't clobber state.
  const reqIdRef = useRef(0);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const requestOpts = { country, language, category, query, startDate, endDate, page: pageNum };
      const myReq = ++reqIdRef.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        if (key) {
          const res = await fetchFromCurrents(key, requestOpts);
          if (myReq !== reqIdRef.current) return;
          if (res.length === 0 && !append) {
            const mock = filterMockPage({ country, language, category, query, page: pageNum });
            setData(mock.articles);
            setHasMore(mock.hasMore);
          } else {
            setData((prev) => (append ? dedupe(prev, res) : res));
            setHasMore(res.length >= 20);
          }
          setEffectiveStatus(status);
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (myReq !== reqIdRef.current) return;
          if (!session) {
            const mock = filterMockPage({ country, language, category, query, page: pageNum });
            setData((prev) => (append ? dedupe(prev, mock.articles) : mock.articles));
            setHasMore(mock.hasMore);
            setEffectiveStatus("mock");
          } else {
            const { articles, hasKey, hasMore: more } = await fetchNewsServer({ data: requestOpts });
            if (myReq !== reqIdRef.current) return;
            if (hasKey) {
              if (articles.length === 0 && !append) {
                const mock = filterMockPage({ country, language, category, query, page: pageNum });
                setData(mock.articles);
                setHasMore(mock.hasMore);
              } else {
                setData((prev) => (append ? dedupe(prev, articles) : articles));
                setHasMore(more);
              }
              setEffectiveStatus("env");
            } else {
              const mock = filterMockPage({ country, language, category, query, page: pageNum });
              setData((prev) => (append ? dedupe(prev, mock.articles) : mock.articles));
              setHasMore(mock.hasMore);
              setEffectiveStatus("mock");
            }
          }
        }
      } catch (e) {
        if (myReq !== reqIdRef.current) return;
        console.error("News fetch failed:", e);
        setError("Unable to load news right now. Showing demo data instead.");
        if (!append) {
          const mock = filterMockPage({ country, language, category, query, page: pageNum });
          setData(mock.articles);
          setHasMore(mock.hasMore);
        } else {
          setHasMore(false);
        }
      } finally {
        if (myReq === reqIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [key, status, country, language, category, query, startDate, endDate],
  );

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    if (keyLoading) return;
    setPage(1);
    fetchPage(1, false);
  }, [keyLoading, fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchPage(next, true);
  }, [loading, loadingMore, hasMore, page, fetchPage]);

  const reload = useCallback(() => {
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);

  return {
    data,
    loading: loading || keyLoading,
    loadingMore,
    error,
    status: effectiveStatus,
    hasMore,
    loadMore,
    reload,
  };
}

/** One-off fetch (used by Globe). Reads user key first, then env via server fn. */
export async function fetchNewsOnce(opts: FetchOpts): Promise<NewsArticle[]> {
  let key = getEnvApiKey();
  if (!key) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_api_keys")
          .select("api_key")
          .eq("user_id", user.id)
          .eq("provider", "currents")
          .maybeSingle();
        key = data?.api_key ?? null;
      }
    } catch {
      /* ignore */
    }
    if (!key && typeof window !== "undefined") {
      key = localStorage.getItem("currentsApiKey");
    }
  }
  if (key) {
    try {
      const res = await fetchFromCurrents(key, opts);
      return res.length ? res : filterMock(opts);
    } catch {
      return filterMock(opts);
    }
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { articles, hasKey } = await fetchNewsServer({ data: opts });
      if (hasKey) return articles.length ? articles : filterMock(opts);
    }
  } catch {
    /* ignore */
  }
  return filterMock(opts);
}

export { MOCK_NEWS };
