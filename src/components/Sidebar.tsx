import { Link, useRouterState } from "@tanstack/react-router";
import { Globe2, Newspaper, Search, Settings, Bookmark, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Globe", icon: Globe2 },
  { to: "/top-news", label: "Top News", icon: Newspaper },
  { to: "/search", label: "Search", icon: Search },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface sticky top-0 z-40">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Globe2 className="w-5 h-5" /> World News
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="p-2 rounded-md hover:bg-secondary transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          open ? "block" : "hidden"
        } md:block md:sticky md:top-0 md:h-screen w-full md:w-60 shrink-0 bg-surface border-r border-border z-30`}
      >
        <div className="hidden md:flex items-center gap-2 px-5 py-5 text-primary font-semibold text-lg">
          <Globe2 className="w-5 h-5" /> World News
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
