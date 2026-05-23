## Goal
Add pagination with a "Load More" button to the news feed. Clicking it fetches the next page and appends articles to the existing list.

## Files to change

### 1. `src/data/mockNews.ts`
- Add `page` and `pageSize` parameters to `filterMock`
- Slice the filtered results based on page and pageSize (default 6 to match the grid)
- Return `{ articles, hasMore }` so the UI knows when to hide the button

### 2. `src/hooks/useNewsApi.ts`
- Add `page?: number` to `FetchOpts`
- Update `fetchFromCurrents` to append `page_number=${page ?? 1}` to the API query string
- Update `useNewsApi` hook:
  - Track `page` state (starts at 1)
  - Track `loadingMore` boolean (separate from initial `loading`)
  - Track `hasMore` boolean
  - On filter changes, reset `page` to 1 and clear data
  - Provide `loadMore()` that increments page, fetches, and appends unique articles (dedupe by `id`)
  - Return `{ data, loading, loadingMore, error, status, hasMore, loadMore, reload }`
- Update `fetchNewsOnce` to pass page through (for Globe page consistency)

### 3. `src/lib/news.functions.ts`
- Add `page?: number` to server-side `FetchOpts`
- Pass `page_number` parameter to Currents API in the server handler
- Return `{ articles, hasKey, hasMore }` from `fetchNewsServer`
- Validate `page` is a positive integer

### 4. `src/pages/TopNewsPage.tsx`
- Destructure `loadingMore`, `hasMore`, `loadMore` from `useNewsApi`
- After the article grid, render:
  - If `hasMore`: a centered "Load More" button with a spinner when `loadingMore` is true
  - If no more results and data exists: a subtle "No more articles" text
- Keep existing filter change behavior (filters reset page automatically via the hook)

### 5. `src/pages/SearchPage.tsx`
- Same "Load More" button pattern as TopNewsPage
- Also show when the user has performed a search (query is set)

## Technical details
- Page size: 6 articles per page (matches the 3-column grid layout)
- Deduplication: when appending, filter out articles whose `id` already exists in `data`
- The Currents API may ignore `page_number`, but the parameter is passed for compatibility if the API supports it
- Mock data (16 items) will properly paginate: page 1 = items 0-5, page 2 = items 6-11, page 3 = items 12-15

## Edge cases handled
- Filter changes reset page to 1 and clear data (no stale pages)
- Empty results on load more: set `hasMore = false`
- Loading spinner only in the button during load-more; initial load still uses the full `LoadingGrid`
- Both signed-in and signed-out (mock data) paths support pagination