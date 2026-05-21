import type { NewsArticle } from "@/types/news";

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

export const MOCK_NEWS: NewsArticle[] = [
  { id: "1", title: "Global markets rally as central banks signal pause", source: "Reuters", country: "US", language: "en", category: ["business"], published: hoursAgo(1), url: "https://example.com/1", image: null, description: "Equities climbed across regions after a coordinated message from major central banks." },
  { id: "2", title: "Tech giants unveil new AI safety alliance", source: "BBC", country: "GB", language: "en", category: ["technology"], published: hoursAgo(2), url: "https://example.com/2", image: null, description: "A new cross-industry consortium aims to set standards for model evaluation." },
  { id: "3", title: "Le sommet climatique s'ouvre à Paris", source: "Le Monde", country: "FR", language: "fr", category: ["world"], published: hoursAgo(3), url: "https://example.com/3", image: null, description: "Les dirigeants mondiaux se réunissent pour discuter d'objectifs ambitieux." },
  { id: "4", title: "Bundestag debattiert über Energiepolitik", source: "Der Spiegel", country: "DE", language: "de", category: ["politics"], published: hoursAgo(4), url: "https://example.com/4", image: null },
  { id: "5", title: "Tokyo unveils next-gen high-speed rail prototype", source: "NHK", country: "JP", language: "en", category: ["technology"], published: hoursAgo(5), url: "https://example.com/5", image: null },
  { id: "6", title: "India launches new lunar mission", source: "Hindustan Times", country: "IN", language: "en", category: ["science"], published: hoursAgo(6), url: "https://example.com/6", image: null },
  { id: "7", title: "Brasil anuncia investimento em energias renováveis", source: "Folha", country: "BR", language: "pt", category: ["business"], published: hoursAgo(7), url: "https://example.com/7", image: null },
  { id: "8", title: "Australia bushfire season begins early", source: "ABC News", country: "AU", language: "en", category: ["world"], published: hoursAgo(8), url: "https://example.com/8", image: null },
  { id: "9", title: "Canada announces new immigration targets", source: "CBC", country: "CA", language: "en", category: ["politics"], published: hoursAgo(9), url: "https://example.com/9", image: null },
  { id: "10", title: "México impulsa nueva ley de transparencia", source: "El Universal", country: "MX", language: "es", category: ["politics"], published: hoursAgo(10), url: "https://example.com/10", image: null },
  { id: "11", title: "South Africa hosts continental trade summit", source: "News24", country: "ZA", language: "en", category: ["business"], published: hoursAgo(11), url: "https://example.com/11", image: null },
  { id: "12", title: "Nigeria's tech sector attracts record investment", source: "Punch", country: "NG", language: "en", category: ["technology"], published: hoursAgo(12), url: "https://example.com/12", image: null },
  { id: "13", title: "中国发布新一代量子计算机", source: "新华社", country: "CN", language: "zh", category: ["technology"], published: hoursAgo(13), url: "https://example.com/13", image: null },
  { id: "14", title: "Россия объявляет о новой космической программе", source: "TASS", country: "RU", language: "ru", category: ["science"], published: hoursAgo(14), url: "https://example.com/14", image: null },
  { id: "15", title: "Korean cinema breaks global box-office records", source: "Korea Herald", country: "KR", language: "en", category: ["entertainment"], published: hoursAgo(15), url: "https://example.com/15", image: null },
  { id: "16", title: "Türkiye'de yeni altyapı projeleri açıklandı", source: "Hürriyet", country: "TR", language: "tr", category: ["business"], published: hoursAgo(16), url: "https://example.com/16", image: null },
];

export function filterMock({ country, language, query }: { country?: string; language?: string; query?: string }): NewsArticle[] {
  return MOCK_NEWS.filter((a) => {
    if (country && a.country !== country) return false;
    if (language && a.language !== language) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = `${a.title} ${a.description ?? ""} ${a.source}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
