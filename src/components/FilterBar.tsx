import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { COUNTRIES, LANGUAGES, CATEGORIES } from "@/utils/countryCodes";

interface Props {
  country?: string;
  language?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  onCountry: (v: string | undefined) => void;
  onLanguage: (v: string | undefined) => void;
  onCategory?: (v: string | undefined) => void;
  onStartDate?: (v: string | undefined) => void;
  onEndDate?: (v: string | undefined) => void;
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function FilterBar({
  country, language, category, startDate, endDate,
  onCountry, onLanguage, onCategory, onStartDate, onEndDate,
}: Props) {
  const { t } = useTranslation();
  const { today, oneMonthAgo } = useMemo(() => {
    const now = new Date();
    const past = new Date();
    past.setDate(past.getDate() - 15);
    return { today: toYMD(now), oneMonthAgo: toYMD(past) };
  }, []);

  const showDates = Boolean(onStartDate && onEndDate);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={country ?? ""}
        onChange={(e) => onCountry(e.target.value || undefined)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">{t("filters.allCountries")}</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
        ))}
      </select>
      <select
        value={language ?? ""}
        onChange={(e) => onLanguage(e.target.value || undefined)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">{t("filters.allLanguages")}</option>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>{l.name}</option>
        ))}
      </select>
      {onCategory && (
        <select
          value={category ?? ""}
          onChange={(e) => onCategory(e.target.value || undefined)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">{t("filters.allCategories")}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
          ))}
        </select>
      )}
      {showDates && (
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col text-xs text-muted-foreground">
            {t("filters.startDate")}
            <input
              type="date"
              value={startDate ?? ""}
              min={oneMonthAgo}
              max={today}
              onChange={(e) => {
                const v = e.target.value || undefined;
                onStartDate?.(v);
                // If end date is now before the new start, clear it
                if (v && endDate && endDate < v) onEndDate?.(undefined);
              }}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>
          <label className="flex flex-col text-xs text-muted-foreground">
            {t("filters.endDate")}
            <input
              type="date"
              value={endDate ?? ""}
              min={startDate || oneMonthAgo}
              max={today}
              onChange={(e) => onEndDate?.(e.target.value || undefined)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>
        </div>
      )}
    </div>
  );
}
