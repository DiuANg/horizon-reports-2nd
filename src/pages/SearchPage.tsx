import { useState, type FormEvent } from "react";
import { Search as SearchIcon } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { NewsCard } from "@/components/NewsCard";
import { LoadingGrid } from "@/components/LoadingState";
import { useNewsApi } from "@/hooks/useNewsApi";
import { useBookmarks } from "@/hooks/useBookmarks";

export function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState<string | undefined>();
  const [country, setCountry] = useState<string | undefined>();
  const [language, setLanguage] = useState<string | undefined>();
  const { data, loading } = useNewsApi({ query, country, language });
  const bm = useBookmarks();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setQuery(input.trim() || undefined);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-1">Search News</h1>
      <p className="text-sm text-muted-foreground mb-6">Find articles across countries and languages.</p>

      <form onSubmit={submit} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search keywords..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>
      <div className="mb-6">
        <FilterBar country={country} language={language} onCountry={setCountry} onLanguage={setLanguage} />
      </div>

      {!query ? (
        <div className="text-center py-20 text-muted-foreground">
          <SearchIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Enter a keyword to start searching.</p>
        </div>
      ) : loading ? (
        <LoadingGrid />
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No results found for "{query}".</div>
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
