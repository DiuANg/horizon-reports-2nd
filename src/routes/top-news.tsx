import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TopNewsPage } from "@/pages/TopNewsPage";

const searchSchema = z.object({
  country: z.string().optional(),
  language: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/top-news")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Top News — World News Dashboard" },
      { name: "description", content: "The latest top headlines from across the world, filtered by country and language." },
    ],
  }),
  component: TopNewsRoute,
});

function TopNewsRoute() {
  const { country, language } = Route.useSearch();
  return <TopNewsPage initialCountry={country} initialLanguage={language} />;
}
