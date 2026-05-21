import { createFileRoute } from "@tanstack/react-router";
import { BookmarksPage } from "@/pages/BookmarksPage";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarks — World News Dashboard" },
      { name: "description", content: "Your saved news articles, persisted across sessions." },
    ],
  }),
  component: BookmarksPage,
});
