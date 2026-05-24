import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogIn, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilterBar } from "@/components/FilterBar";
import { NewsCard } from "@/components/NewsCard";
import { LoadingGrid } from "@/components/LoadingState";
import { useNewsApi } from "@/hooks/useNewsApi";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

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
  const { data, loading, loadingMore, hasMore, loadMore, status, error } = useNewsApi({ country, language, category, startDate, endDate });
  const bm = useBookmarks();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const showSignInPrompt = !authLoading && !user && status === "mock";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("topNews.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {showSignInPrompt
              ? t("topNews.subtitleGuest")
              : status === "mock"
              ? t("topNews.subtitleMock")
              : t("topNews.subtitleLive")}
          </p>
        </div>
        <FilterBar
          country={country} language={language} category={category}
          startDate={startDate} endDate={endDate}
          onCountry={setCountry} onLanguage={setLanguage} onCategory={setCategory}
          onStartDate={setStartDate} onEndDate={setEndDate}
        />
      </div>
      {showSignInPrompt && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <LogIn className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">{t("auth.signInToViewLive")}</p>
              <p className="text-xs text-muted-foreground">{t("auth.guestsOnlyDemo")}</p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link to="/auth">{t("auth.signIn")}</Link>
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {loading ? (
        <LoadingGrid />
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">{t("topNews.noMatch")}</div>
      ) : (
        <>
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
          <div className="flex justify-center mt-8">
            {hasMore ? (
              <Button onClick={loadMore} disabled={loadingMore} variant="outline" size="lg">
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("common.loadMore")
                )}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">{t("common.reachedEnd")}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
