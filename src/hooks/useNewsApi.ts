import { useCallback, useEffect, useState } from "react";
import { filterMock, MOCK_NEWS } from "@/data/mockNews";
import type { NewsArticle } from "@/types/news";
import { useApiKey, getEnvApiKey } from "@/hooks/useApiKey";
import { supabase } from "@/integrations/supabase/client";

export type { ApiKeyStatus } from "@/hooks/useApiKey";

interface FetchOpts {
  country?: string;
  language?: string;
  category?: string;
  query?: string;
}

async function fetchFromCurrents(key: string, opts: FetchOpts): Promise<NewsArticle[]> {
  const params = new URLSearchParams();
  if (opts.country) params.set("country", opts.country);
  if (opts.language) params.set("language", opts.language);
  if (opts.category) params.set("category", opts.category);
  const endpoint = opts.query
    ? `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(opts.query)}&${params}`
    : `https://api.currentsapi.services/v1/latest-news?${params}`;
  const res = await fetch(endpoint, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Currents API error ${res.status}`);
  const json = await res.json();
  const items = (json.news ?? []) as Array<{
    id: string; title: string; description?: string; url: string; author?: string;
    image?: string | null; language?: string; category?: string[]; published: string;
  }>;
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
    source: (() => { try { return new URL(n.url).hostname.replace(/^www\./, ""); } catch { return n.author ?? "Unknown"; } })(),
    country: opts.country,
  }));
}

export function useNewsApi(opts: FetchOpts) {
  const { key, status, loading: keyLoading } = useApiKey();
  const [data, setData] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (key) {
        const res = await fetchFromCurrents(key, opts);
        setData(res.length ? res : filterMock(opts));
      } else {
        await new Promise((r) => setTimeout(r, 150));
        setData(filterMock(opts));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch";
      setError(msg);
      setData(filterMock(opts));
    } finally {
      setLoading(false);
    }
  }, [key, opts.country, opts.language, opts.category, opts.query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (!keyLoading) load(); }, [keyLoading, load]);

  return { data, loading: loading || keyLoading, error, status, reload: load };
}

/** One-off fetch (used by Globe). Reads key from env or current user. */
export async function fetchNewsOnce(opts: FetchOpts): Promise<NewsArticle[]> {
  let key = getEnvApiKey();
  if (!key) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_api_keys")
          .select("api_key")
          .eq("user_id", user.id)
          .eq("provider", "currents")
          .maybeSingle();
        key = data?.api_key ?? null;
      }
    } catch { /* ignore */ }
    if (!key && typeof window !== "undefined") {
      key = localStorage.getItem("currentsApiKey");
    }
  }
  if (!key) return filterMock(opts);
  try {
    const res = await fetchFromCurrents(key, opts);
    return res.length ? res : filterMock(opts);
  } catch {
    return filterMock(opts);
  }
}

export { MOCK_NEWS };
