import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/pages/SearchPage";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — World News Dashboard" },
      { name: "description", content: "Search world news by keyword, country, and language." },
    ],
  }),
  component: SearchPage,
});
