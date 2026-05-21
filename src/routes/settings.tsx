import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/SettingsPage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — World News Dashboard" },
      { name: "description", content: "Manage your Currents API key and saved bookmarks." },
    ],
  }),
  component: SettingsPage,
});
