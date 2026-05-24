import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGS = [
  { code: "en", labelKey: "language.english", short: "EN" },
  { code: "vi", labelKey: "language.vietnamese", short: "VI" },
] as const;

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = LANGS.find((l) => i18n.language?.startsWith(l.code)) ?? LANGS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language.label")}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors w-full"
      >
        <Languages className="w-4 h-4" />
        <span className="text-xs font-medium">{current.short}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[10rem]">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => i18n.changeLanguage(l.code)}
            className={i18n.language?.startsWith(l.code) ? "font-medium text-primary" : ""}
          >
            {t(l.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
