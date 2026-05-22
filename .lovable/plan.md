# Add date range filter to news

## UI changes

**`src/components/FilterBar.tsx`**
- Add two new optional props: `startDate`, `endDate`, `onStartDate`, `onEndDate`.
- Render two side-by-side `<input type="date">` fields labelled "Start Date" and "End Date", styled to match the existing selects.
- Compute `today` and `oneMonthAgo` (today − 30 days) as `YYYY-MM-DD` strings at render time.
- Both inputs: `min={oneMonthAgo}`, `max={today}`.
- End Date input's `min` is dynamic: `startDate || oneMonthAgo`, so it can never be before the chosen start.
- When the user picks a Start Date later than the current End Date, clear the End Date (or push it forward) to keep the range valid.

**`src/pages/TopNewsPage.tsx` and `src/pages/SearchPage.tsx`**
- Add `startDate`/`endDate` state, pass to `FilterBar` and to `useNewsApi`.

**`src/routes/top-news.tsx`** (and `src/routes/search.tsx` if it has searchSchema)
- Extend the Zod search schema with optional `startDate`, `endDate` strings so the filter is shareable via URL.

## Data flow

**`src/hooks/useNewsApi.ts`**
- Extend `FetchOpts` with `startDate?: string; endDate?: string`.
- Pass through to both the direct `fetchFromCurrents` client call and the `fetchNewsServer` server function.
- Add to the `useCallback` deps.

**`src/lib/news.functions.ts`** (server fn)
- Extend `FetchOpts` with `startDate`/`endDate`.
- Validate format strictly: `/^\d{4}-\d{2}-\d{2}$/`, parseable Date, not in the future, not older than 31 days, end >= start.
- Forward to Currents as `start_date` and `end_date` query params (Currents accepts `YYYY-MM-DDTHH:mm:ss±zz:zz`; we'll send `${startDate}T00:00:00+00:00` and `${endDate}T23:59:59+00:00`).
- Apply on both `latest-news` and `search` endpoints.

**Client `fetchFromCurrents` in `useNewsApi.ts`**
- Same query-param additions for the direct-key path so behaviour matches the server path.

## Validation summary

- HTML-level: `min`/`max` on both inputs; End Date `min` re-derived from Start Date.
- Server-level: regex + range bounds in `validate()` so the API can't be abused with arbitrary dates.

## Out of scope

- No design system overhaul; reuse existing input styling tokens.
- Bookmarks/Globe pages unchanged (they don't expose FilterBar date controls).
