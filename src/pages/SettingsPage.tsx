import { useState } from "react";
import { toast } from "sonner";
import { Key, Bookmark as BookmarkIcon, Info, Trash2, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useApiKey } from "@/hooks/useApiKey";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";

function mask(key: string) {
  if (!key) return "";
  return key.slice(0, 10) + "•".repeat(Math.max(0, key.length - 10));
}

export function SettingsPage() {
  const { user } = useAuth();
  const { key, status, save, clear } = useApiKey();
  const [input, setInput] = useState("");
  const bm = useBookmarks();
  const { t } = useTranslation();

  const onSave = async () => {
    if (!input.trim()) { toast.error("Please enter an API key"); return; }
    await save(input);
    setInput("");
    toast.success(user ? "API key saved to your account" : "API key saved on this device");
  };

  const onClear = async () => {
    await clear();
    toast.success("Saved key cleared");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(bm.bookmarks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge =
    status === "env" ? { text: t("settings.statusEnv"), cls: "bg-primary/15 text-primary" }
    : status === "remote" ? { text: t("settings.statusRemote"), cls: "bg-primary/15 text-primary" }
    : status === "local" ? { text: t("settings.statusLocal"), cls: "bg-primary/15 text-primary" }
    : { text: t("settings.statusNone"), cls: "bg-secondary text-muted-foreground" };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </header>

      {!user && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Lock className="w-4 h-4 text-primary" />
          <p className="text-sm flex-1">
            <Link to="/auth" className="text-primary hover:underline">{t("auth.signIn")}</Link> {t("auth.signInToSaveSettings")}
          </p>
        </div>
      )}

      <section className="bg-card border border-border rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">{t("settings.apiKey")}</h2>
          <span className={`ml-auto text-xs px-2 py-1 rounded-md ${statusBadge.cls}`}>{statusBadge.text}</span>
        </div>
        {key && (
          <p className="text-xs text-muted-foreground font-mono break-all">{t("settings.currentKey")}: {mask(key)}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("settings.apiKeyPlaceholder")}
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            {t("settings.saveKey")}
          </button>
        </div>
        {(status === "local" || status === "remote") && (
          <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> {t("settings.clearSavedKey")}
          </button>
        )}
      </section>

      <section className="bg-card border border-border rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">{t("bookmarks.title")}</h2>
          <span className="ml-auto text-xs text-muted-foreground">{t("settings.savedCount", { count: bm.bookmarks.length })}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportJson} className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary transition-colors">
            {t("settings.exportJson")}
          </button>
          <button
            onClick={() => {
              if (confirm(t("settings.confirmClearAll"))) {
                bm.clearAll();
                toast.success("All bookmarks deleted");
              }
            }}
            className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
          >
            {t("settings.clearAll")}
          </button>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">{t("settings.about")}</h2>
        </div>
        <ul className="text-sm space-y-1.5">
          <li><a href="https://currentsapi.services/en/docs" target="_blank" rel="noreferrer" className="text-primary hover:underline">Currents API docs</a></li>
          <li><a href="https://currentsapi.services" target="_blank" rel="noreferrer" className="text-primary hover:underline">Sign up for a free API key</a></li>
          <li className="text-muted-foreground text-xs pt-2">World News Dashboard · v1.0</li>
        </ul>
      </section>
    </div>
  );
}
