import { useCallback, useEffect, useState } from "react";
import { filterMock } from "@/data/mockNews";
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

async function fetchFromCurrents(key: string, opts: FetchOpts): Promise<NewsArticle[]> {
  const params = new URLSearchParams();
  if (opts.country) params.set("country", opts.country);
  if (opts.language) params.set("language", opts.language);
  if (opts.category) params.set("category", opts.category);
  if (opts.startDate) params.set("start_date", startOfDayUtc(opts.startDate));
  if (opts.endDate) params.set("end_date", endOfDayUtc(opts.endDate));
  const hasDates = !!(opts.startDate || opts.endDate);
  const useSearch = !!opts.query || hasDates;
  if (useSearch) params.set("keywords", opts.query?.trim() || "*");
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

export function useNewsApi(opts: FetchOpts) {
  const { key, status, loading: keyLoading } = useApiKey();
  const [data, setData] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [effectiveStatus, setEffectiveStatus] = useState(status);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (key) {
        const res = await fetchFromCurrents(key, opts);
        setData(res.length ? res : filterMock(opts));
        setEffectiveStatus(status);
      } else {
        // Fall back to server-side env CURRENTS_API_KEY
        const { articles, hasKey } = await fetchNewsServer({ data: opts });
        if (hasKey) {
          setData(articles.length ? articles : filterMock(opts));
          setEffectiveStatus("env");
        } else {
          setData(filterMock(opts));
          setEffectiveStatus("mock");
        }
      }
    } catch (e) {
      console.error("News fetch failed:", e);
      setError("Unable to load news right now. Showing demo data instead.");
      setData(filterMock(opts));
    } finally {
      setLoading(false);
    }
  }, [
    key,
    status,
    opts.country,
    opts.language,
    opts.category,
    opts.query,
    opts.startDate,
    opts.endDate,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!keyLoading) load();
  }, [keyLoading, load]);

  return { data, loading: loading || keyLoading, error, status: effectiveStatus, reload: load };
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
    const { articles, hasKey } = await fetchNewsServer({ data: opts });
    if (hasKey) return articles.length ? articles : filterMock(opts);
  } catch {
    /* ignore */
  }
  return filterMock(opts);
}

export { MOCK_NEWS };
