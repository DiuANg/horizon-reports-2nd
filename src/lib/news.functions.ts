import { createServerFn } from "@tanstack/react-start";
import type { NewsArticle } from "@/types/news";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface FetchOpts {
  country?: string;
  language?: string;
  category?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
}

const ALLOWED_COUNTRY = /^[A-Za-z]{2,4}$/;
const ALLOWED_LANGUAGE = /^[A-Za-z]{2}$/;
const ALLOWED_CATEGORY = /^[a-zA-Z_-]{1,32}$/;
const ALLOWED_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

interface CurrentsResponse {
  news?: CurrentsNewsItem[];
}

function startOfDayUtc(date: string): string {
  return `${date}T00:00:00.000+00:00`;
}

function endOfDayUtc(date: string): string {
  return `${date}T23:59:59.000+00:00`;
}

function mapItems(json: CurrentsResponse, country?: string): NewsArticle[] {
  const items = json.news ?? [];
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
    country,
  }));
}

function validateDate(s: string, field: string): string {
  if (!ALLOWED_DATE.test(s)) throw new Error(`Invalid ${field}`);
  const d = new Date(`${s}T00:00:00Z`);
  if (isNaN(d.getTime())) throw new Error(`Invalid ${field}`);
  const now = new Date();
  const minDate = new Date();
  minDate.setUTCDate(minDate.getUTCDate() - 16);
  if (d.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
    throw new Error(`${field} cannot be in the future`);
  }
  if (d.getTime() < minDate.getTime()) {
    throw new Error(`${field} cannot be older than 15 days`);
  }
  return s;
}

function validate(input: FetchOpts): FetchOpts {
  const out: FetchOpts = {};
  if (input.country) {
    if (!ALLOWED_COUNTRY.test(input.country)) throw new Error("Invalid country");
    out.country = input.country;
  }
  if (input.language) {
    if (!ALLOWED_LANGUAGE.test(input.language)) throw new Error("Invalid language");
    out.language = input.language;
  }
  if (input.category) {
    if (!ALLOWED_CATEGORY.test(input.category)) throw new Error("Invalid category");
    out.category = input.category;
  }
  if (input.query) {
    if (typeof input.query !== "string" || input.query.length > 200) {
      throw new Error("Invalid query");
    }
    out.query = input.query;
  }
  if (input.startDate) out.startDate = validateDate(input.startDate, "startDate");
  if (input.endDate) out.endDate = validateDate(input.endDate, "endDate");
  if (out.startDate && out.endDate) {
    if (out.endDate < out.startDate) {
      throw new Error("endDate must be on or after startDate");
    }
    const days = (new Date(out.endDate).getTime() - new Date(out.startDate).getTime()) / 86400000;
    if (days > 15) throw new Error("Date range cannot exceed 15 days");
  }
  return out;
}

export const fetchNewsServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: FetchOpts) => validate(input))
  .handler(async ({ data }) => {
    const key = process.env.CURRENTS_API_KEY;
    if (!key) return { articles: [] as NewsArticle[], hasKey: false };
    const params = new URLSearchParams();
    if (data.country) params.set("country", data.country);
    if (data.language) params.set("language", data.language);
    if (data.category) params.set("category", data.category);
    if (data.startDate) params.set("start_date", startOfDayUtc(data.startDate));
    if (data.endDate) params.set("end_date", endOfDayUtc(data.endDate));
    const hasDates = !!(data.startDate || data.endDate);
    const useSearch = !!data.query || hasDates;
    if (useSearch) params.set("keywords", data.query?.trim() || "news");
    const endpoint = useSearch
      ? `https://api.currentsapi.services/v2/search?${params}`
      : `https://api.currentsapi.services/v2/latest-news?${params}`;
    const res = await fetch(endpoint, { headers: { Authorization: key } });
    if (!res.ok) {
      console.error("Currents API request failed", {
        status: res.status,
        body: await res.text(),
      });
      return { articles: [] as NewsArticle[], hasKey: true };
    }
    const json = await res.json();
    return { articles: mapItems(json, data.country), hasKey: true };
  });
