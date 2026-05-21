import { useCallback, useEffect, useState } from "react";
import { filterMock, MOCK_NEWS } from "@/data/mockNews";
import type { NewsArticle } from "@/types/news";

const STORAGE_KEY = "currentsApiKey";

export type ApiKeyStatus = "env" | "local" | "mock";

export function getApiKey(): { key: string | null; status: ApiKeyStatus } {
  const envKey = (import.meta.env.VITE_CURRENTS_API_KEY as string | undefined) || null;
  if (envKey) return { key: envKey, status: "env" };
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return { key: local, status: "local" };
  }
  return { key: null, status: "mock" };
}

export function saveApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key.trim());
}
export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}

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
  const [data, setData] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ApiKeyStatus>("mock");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { key, status } = getApiKey();
    setStatus(status);
    try {
      if (key) {
        const res = await fetchFromCurrents(key, opts);
        setData(res.length ? res : filterMock(opts));
      } else {
        await new Promise((r) => setTimeout(r, 250));
        setData(filterMock(opts));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch";
      setError(msg);
      setData(filterMock(opts));
    } finally {
      setLoading(false);
    }
  }, [opts.country, opts.language, opts.query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, status, reload: load };
}

export async function fetchNewsOnce(opts: FetchOpts): Promise<NewsArticle[]> {
  const { key } = getApiKey();
  if (!key) return filterMock(opts);
  try {
    const res = await fetchFromCurrents(key, opts);
    return res.length ? res : filterMock(opts);
  } catch {
    return filterMock(opts);
  }
}

export { MOCK_NEWS };
