import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import { useTranslation } from "react-i18next";
import { FilterBar } from "@/components/FilterBar";
import { NewsPopup } from "@/components/NewsPopup";
import { fetchNewsOnce } from "@/hooks/useNewsApi";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { NewsArticle } from "@/types/news";

const GEO_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";

interface CountryFeature {
  type: "Feature";
  properties: { name: string };
  id?: string;
  geometry: unknown;
}

// Minimal ISO numeric -> alpha-2 map for popular countries
const NUM_TO_ALPHA2: Record<string, string> = {
  "004": "AF", "008": "AL", "012": "DZ", "032": "AR", "036": "AU", "040": "AT",
  "056": "BE", "076": "BR", "100": "BG", "124": "CA", "152": "CL", "156": "CN",
  "170": "CO", "188": "CR", "203": "CZ", "208": "DK", "218": "EC", "246": "FI",
  "250": "FR", "276": "DE", "300": "GR", "344": "HK", "348": "HU", "352": "IS",
  "356": "IN", "360": "ID", "364": "IR", "368": "IQ", "372": "IE", "376": "IL",
  "380": "IT", "392": "JP", "400": "JO", "404": "KE", "410": "KR", "414": "KW",
  "428": "LV", "440": "LT", "458": "MY", "484": "MX", "504": "MA", "528": "NL",
  "554": "NZ", "566": "NG", "578": "NO", "586": "PK", "604": "PE", "608": "PH",
  "616": "PL", "620": "PT", "642": "RO", "643": "RU", "682": "SA", "702": "SG",
  "703": "SK", "705": "SI", "710": "ZA", "724": "ES", "752": "SE", "756": "CH",
  "764": "TH", "788": "TN", "792": "TR", "804": "UA", "818": "EG", "826": "GB",
  "840": "US", "858": "UY", "862": "VE", "704": "VN", "894": "ZM",
};

// Topojson features extraction
async function loadCountries(): Promise<CountryFeature[]> {
  const res = await fetch(GEO_URL);
  const topo = await res.json();
  const topojson = await import("topojson-client");
  const fc = topojson.feature(topo, topo.objects.countries) as unknown as {
    features: CountryFeature[];
  };
  return fc.features;
}

export function GlobePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [features, setFeatures] = useState<CountryFeature[]>([]);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [hovered, setHovered] = useState<CountryFeature | null>(null);
  const [language, setLanguage] = useState<string | undefined>("en");
  const [filterCountry, setFilterCountry] = useState<string | undefined>();
  const [selected, setSelected] = useState<{ code: string; name: string } | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const bm = useBookmarks();
  const { t } = useTranslation();

  useEffect(() => {
    loadCountries().then(setFeatures).catch(() => setFeatures([]));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      const r = containerRef.current!.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = !selected;
    controls.autoRotateSpeed = 0.35;
    controls.enableZoom = true;
  }, [features.length, selected]);

  const polygons = useMemo(() => {
    if (!filterCountry) return features;
    return features.filter((f) => NUM_TO_ALPHA2[String(f.id ?? "").padStart(3, "0")] === filterCountry);
  }, [features, filterCountry]);

  const handlePolygonClick = async (polygon: object) => {
    const f = polygon as CountryFeature;
    const code = NUM_TO_ALPHA2[String(f.id ?? "").padStart(3, "0")];
    const name = f.properties.name;
    if (!code) {
      // Unsupported country in our map; still open popup with name only.
      setSelected({ code: "", name });
      setArticles([]);
      return;
    }
    setSelected({ code, name });
    setLoading(true);
    const res = await fetchNewsOnce({ country: code, language });
    setArticles(res);
    setLoading(false);
  };

  return (
    <div className="relative h-[calc(100vh-3.5rem)] md:h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface/60 backdrop-blur-md z-10">
        <div>
          <h1 className="text-lg font-semibold">{t("globe.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("globe.subtitle")}</p>
        </div>
        <FilterBar
          country={filterCountry}
          language={language}
          onCountry={setFilterCountry}
          onLanguage={setLanguage}
        />
      </div>
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          polygonsData={polygons}
          polygonAltitude={(d) => (d === hovered ? 0.02 : 0.008)}
          polygonCapColor={(d) =>
            d === hovered ? "rgba(20, 184, 166, 0.55)" : "rgba(20, 184, 166, 0.08)"
          }
          polygonSideColor={() => "rgba(20, 184, 166, 0.15)"}
          polygonStrokeColor={() => "rgba(125, 211, 252, 0.35)"}
          polygonLabel={(d) => {
            const f = d as CountryFeature;
            return `<div style="background:rgba(15,23,42,0.9);color:#fff;padding:6px 10px;border-radius:6px;font-size:12px;border:1px solid rgba(20,184,166,0.3)">${f.properties.name}</div>`;
          }}
          onPolygonHover={(p) => setHovered((p as CountryFeature) ?? null)}
          onPolygonClick={handlePolygonClick}
          atmosphereColor="#14b8a6"
          atmosphereAltitude={0.18}
        />
        {selected && (
          <NewsPopup
            country={selected}
            articles={articles}
            loading={loading}
            isBookmarked={bm.isBookmarked}
            onToggleBookmark={bm.toggle}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
