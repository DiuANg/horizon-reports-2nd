import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/LoadingState";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Interactive Globe — World News Dashboard" },
      { name: "description", content: "Spin the globe and click any country to read its latest news." },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  const [Comp, setComp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    setMounted(true);
    import("@/pages/GlobePage").then((m) => setComp(() => m.GlobePage));
  }, []);

  if (!mounted || !Comp) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner label="Loading globe..." />
      </div>
    );
  }
  return <Comp />;
}
