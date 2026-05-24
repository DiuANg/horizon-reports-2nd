# Add i18n (English + Vietnamese) with react-i18next

## Setup
- Install: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- Create `src/i18n/index.ts` — initialize i18next with `en` and `vi` resources, language detector (localStorage + navigator), fallback `en`, `react: { useSuspense: false }` (safe for SSR/prerender)
- Import the config once in `src/router.tsx` (or `src/start.ts` client side) so it loads before components render

## Translation dictionaries
Create `src/i18n/locales/en.json` and `src/i18n/locales/vi.json` with namespaced keys:

```
nav.globe, nav.topNews, nav.search, nav.bookmarks, nav.settings
auth.signIn, auth.signOut, auth.signInToViewLive, auth.guestsOnlyDemo
common.loadMore, common.loading, common.reachedEnd, common.search
filters.allCountries, filters.allLanguages, filters.allCategories,
filters.startDate, filters.endDate
topNews.title, topNews.subtitleGuest, topNews.subtitleMock, topNews.subtitleLive,
topNews.noMatch
search.title, search.subtitle, search.placeholder, search.empty, search.noResults
language.label, language.english, language.vietnamese
```

Vietnamese translations provided for every key.

## Component updates (replace hardcoded strings with `t()`)
- `src/components/Sidebar.tsx` — nav labels, "World News" brand kept as-is
- `src/components/UserMenu.tsx` — "Sign in", sign-out aria
- `src/components/FilterBar.tsx` — select placeholders, date labels
- `src/pages/TopNewsPage.tsx` — title, subtitles, sign-in banner, load more, empty state
- `src/pages/SearchPage.tsx` — title, subtitle, placeholder, button, empty/no-results, load more
- `src/pages/BookmarksPage.tsx` — visible strings (read file first)
- `src/pages/SettingsPage.tsx` — visible strings (read file first)

## Language switcher
- New component `src/components/LanguageSwitcher.tsx` — shadcn `DropdownMenu` trigger with `Languages` lucide icon + current language code (EN/VI). Options call `i18n.changeLanguage()` and persist via detector's localStorage cache.
- Place it in `src/components/Sidebar.tsx` footer next to `UserMenu` (compact, icon-led to fit the 60px sidebar width on desktop and the mobile menu).

## Notes
- No business-logic changes; UI/presentation only.
- Default language: detected, fallback English.
- Keep API/data values untranslated (article content comes from the API).
