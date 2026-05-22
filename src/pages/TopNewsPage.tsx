import { useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { NewsCard } from "@/components/NewsCard";
import { LoadingGrid } from "@/components/LoadingState";
import { useNewsApi } from "@/hooks/useNewsApi";
import { useBookmarks } from "@/hooks/useBookmarks";

interface Props {
  initialCountry?: string;
  initialLanguage?: string;
  initialCategory?: string;
}

export function TopNewsPage({ initialCountry, initialLanguage, initialCategory }: Props) {
  const [country, setCountry] = useState<string | undefined>(initialCountry);
  const [language, setLanguage] = useState<string | undefined>(initialLanguage ?? "en");
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const { data, loading, status, error } = useNewsApi({ country, language, category, startDate, endDate });
  const bm = useBookmarks();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Top News</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {status === "mock" ? "Showing demo data — add a Currents API key in Settings for live news." : "Latest headlines from around the world."}
          </p>
        </div>
        <FilterBar
          country={country} language={language} category={category}
          startDate={startDate} endDate={endDate}
          onCountry={setCountry} onLanguage={setLanguage} onCategory={setCategory}
          onStartDate={setStartDate} onEndDate={setEndDate}
        />
      </div>
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {loading ? (
        <LoadingGrid />
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No articles match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((a) => (
            <NewsCard
              key={a.id}
              article={a}
              bookmarked={bm.isBookmarked(a.url)}
              onToggleBookmark={() => bm.toggle(a)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
