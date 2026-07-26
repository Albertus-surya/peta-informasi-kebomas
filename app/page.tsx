"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CategoryAccordion from "@/components/sidebar/CategoryAccordion";
import SearchBar from "@/components/sidebar/SearchBar";
import MobileBottomSheet from "@/components/sidebar/MobileBottomSheet";
import Footer from "@/components/layout/Footer";
import { SidebarSkeleton, MapSkeleton } from "@/components/ui/Skeleton";
import type { Category, LocationWithCategory } from "@/types/database";
import type { FeatureCollection } from "geojson";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

type LoadState = "loading" | "ready" | "error";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationWithCategory[]>([]);
  const [boundaryData, setBoundaryData] = useState<FeatureCollection | null>(
    null
  );
  const [highlightData, setHighlightData] =
    useState<FeatureCollection | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const supabase = createClient();

        const [categoriesRes, locationsRes, boundaryRes, highlightRes] =
          await Promise.all([
            supabase.from("categories").select("*").order("created_at"),
            supabase
              .from("locations")
              .select("*, categories(id, name, icon)")
              .order("created_at"),
            fetch("/geojson/kebomas-boundary.min.geojson").then((r) =>
              r.ok ? r.json() : fetch("/geojson/kebomas-boundary.geojson").then((r2) => r2.json())
            ),
            fetch("/geojson/kelurahan-kebomas-highlight.geojson").then((r) =>
              r.json()
            ),
          ]);

        if (cancelled) return;

        if (categoriesRes.error) throw categoriesRes.error;
        if (locationsRes.error) throw locationsRes.error;

        setCategories(categoriesRes.data ?? []);
        setLocations((locationsRes.data as LocationWithCategory[]) ?? []);
        setBoundaryData(boundaryRes);
        setHighlightData(highlightRes);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        toast.error("Gagal memuat data lokasi. Coba muat ulang halaman.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-ink-300 bg-white px-4 py-2.5 shadow-sm">
        <h1 className="text-base font-semibold text-ink-900">
          Peta Informasi Kebomas
        </h1>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-80 shrink-0 flex-col border-r border-ink-300 bg-white sm:flex">
          <div className="border-b border-ink-300 p-3">
            <SearchBar locations={locations} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto kd-scroll">
            {status === "loading" && <SidebarSkeleton />}
            {status === "error" && <ErrorState />}
            {status === "ready" && (
              <CategoryAccordion categories={categories} locations={locations} />
            )}
          </div>
        </aside>

        {/* Mobile search bar floats over map */}
        <div className="absolute inset-x-3 top-3 z-[900] sm:hidden">
          <SearchBar locations={locations} />
        </div>

        {/* Map */}
        <main className="relative min-h-0 flex-1">
          {status !== "error" && boundaryData && highlightData ? (
            <MapView
              boundaryData={boundaryData}
              highlightData={highlightData}
              locations={locations}
            />
          ) : status === "loading" ? (
            <MapSkeleton />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ErrorState />
            </div>
          )}
        </main>

        {/* Mobile bottom sheet */}
        <MobileBottomSheet>
          {status === "loading" && <SidebarSkeleton />}
          {status === "error" && <ErrorState />}
          {status === "ready" && (
            <CategoryAccordion categories={categories} locations={locations} />
          )}
        </MobileBottomSheet>
      </div>

      <Footer />
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <AlertTriangle size={28} className="text-brand-orange" />
      <p className="text-sm font-medium text-ink-900">
        Data tidak dapat dimuat
      </p>
      <p className="text-xs text-ink-500">
        Periksa koneksi internet Anda lalu muat ulang halaman.
      </p>
    </div>
  );
}
