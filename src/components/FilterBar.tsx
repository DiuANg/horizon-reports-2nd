import { COUNTRIES, LANGUAGES, CATEGORIES } from "@/utils/countryCodes";

interface Props {
  country?: string;
  language?: string;
  category?: string;
  onCountry: (v: string | undefined) => void;
  onLanguage: (v: string | undefined) => void;
  onCategory?: (v: string | undefined) => void;
}

export function FilterBar({ country, language, category, onCountry, onLanguage, onCategory }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={country ?? ""}
        onChange={(e) => onCountry(e.target.value || undefined)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">All countries</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
        ))}
      </select>
      <select
        value={language ?? ""}
        onChange={(e) => onLanguage(e.target.value || undefined)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">All languages</option>
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
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
          ))}
        </select>
      )}
    </div>
  );
}
