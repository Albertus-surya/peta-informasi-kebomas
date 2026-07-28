"use client";

import { useEffect, useMemo, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import * as Icons from "lucide-react";
import { Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { copyToClipboard } from "@/lib/utils";
import { useMapStore } from "@/lib/store/mapStore";
import type { LocationWithCategory } from "@/types/database";

const CLUSTER_THRESHOLD = 50;

function buildDivIcon(iconName: string, active: boolean, color: string) {
  const LucideIcon =
    (Icons as unknown as Record<string, React.ComponentType<any>>)[
      iconName
    ] ?? Icons.MapPin;

  const html = renderToStaticMarkup(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: active ? 36 : 30,
        height: active ? 36 : 30,
        borderRadius: "9999px",
        background: color,
        border: active ? "3px solid #2563eb" : "2px solid white",
        boxShadow: active
          ? "0 0 0 2px white, 0 2px 8px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.3)",
        transition: "all 0.15s ease",
      }}
    >
      <LucideIcon color="white" size={active ? 18 : 15} strokeWidth={2.25} />
    </div>
  );

  return L.divIcon({
    html,
    className: "kd-marker-icon",
    iconSize: [active ? 36 : 30, active ? 36 : 30],
    iconAnchor: [active ? 18 : 15, active ? 18 : 15],
    popupAnchor: [0, -(active ? 18 : 15)],
  });
}

interface MarkerLayerProps {
  locations: LocationWithCategory[];
}

export default function MarkerLayer({ locations }: MarkerLayerProps) {
  const map = useMap();
  const selectedLocation = useMapStore((s) => s.selectedLocation);
  const flyToLocation = useMapStore((s) => s.flyToLocation);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const popupRefs = useRef<Map<string, L.Popup>>(new Map());

  // Saat lokasi dipilih dari sidebar/pencarian ATAU klik langsung di titik,
  // peta akan flyTo ke lokasi tsb dengan animasi berdurasi 1.1 detik
  // (lihat FlyToController di MapView.tsx). Popup HARUS dibuka setelah
  // animasi itu benar-benar selesai (event "moveend"), bukan lewat delay
  // tebakan yang lebih pendek dari 1.1 detik — kalau dibuka lebih awal,
  // Leaflet menghitung auto-pan berdasarkan posisi kamera yang belum final,
  // sehingga begitu animasi kelar, card popup sudah bergeser dan jadi
  // kepotong tepi kontainer peta.
  useEffect(() => {
    if (!selectedLocation) return;
    const marker = markerRefs.current.get(selectedLocation.id);
    if (!marker) return;

    let opened = false;
    const openOnce = () => {
      if (opened) return;
      opened = true;
      marker.openPopup();
    };

    map.once("moveend", openOnce);
    // Jaga-jaga: kalau moveend tidak pernah terpicu (mis. lokasi yang
    // dipilih sama dengan posisi peta saat ini sehingga flyTo tidak
    // benar-benar bergerak), tetap buka popup setelah durasi flyTo lewat.
    const fallback = setTimeout(openOnce, 1300);

    return () => {
      map.off("moveend", openOnce);
      clearTimeout(fallback);
    };
  }, [selectedLocation, map]);

  const markers = useMemo(
    () =>
      locations.map((loc) => {
        const isActive = selectedLocation?.id === loc.id;
        const icon = buildDivIcon(
          loc.categories?.icon ?? "MapPin",
          isActive,
          loc.categories?.color ?? "#f97316"
        );

        return (
          <Marker
            key={loc.id}
            ref={(instance) => {
              if (instance) markerRefs.current.set(loc.id, instance);
              else markerRefs.current.delete(loc.id);
            }}
            position={[loc.latitude, loc.longitude]}
            icon={icon}
            eventHandlers={{
              click: (e) => {
                // Leaflet secara bawaan langsung membuka popup begitu marker
                // diklik (sebelum flyTo mulai/selesai). Tutup dulu di sini
                // supaya pembukaan popup sepenuhnya dikendalikan oleh efek
                // di atas, yang menunggu peta selesai flyTo (event "moveend").
                e.target.closePopup();
                flyToLocation(loc);
              },
            }}
          >
            <Popup
              ref={(instance) => {
                if (instance) popupRefs.current.set(loc.id, instance);
                else popupRefs.current.delete(loc.id);
              }}
              autoPanPaddingTopLeft={[24, 100]}
              autoPanPaddingBottomRight={[24, 24]}
            >
              <div className="w-full animate-fade-in">
                {loc.image_url && (
                  <img
                    src={loc.image_url}
                    alt={`Foto ${loc.name}`}
                    className="h-32 w-full object-cover bg-ink-100"
                    // Ukuran popup dihitung Leaflet SEBELUM gambar selesai dimuat,
                    // sehingga auto-pan memakai tinggi card yang masih kecil (tanpa gambar).
                    // Setelah gambar termuat, card membesar ke atas dan bagian atasnya
                    // (foto) jadi terpotong oleh tepi kontainer peta. Memanggil
                    // popup.update() di sini memaksa Leaflet menghitung ulang layout
                    // + auto-pan (adjustPan) dengan ukuran final yang benar.
                    onLoad={() => popupRefs.current.get(loc.id)?.update()}
                    onError={() => popupRefs.current.get(loc.id)?.update()}
                  />
                )}
                <div className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-snug text-ink-900">
                      {loc.name}
                    </h3>
                    <a
                      href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Buka di Google Maps"
                      className="shrink-0 text-ink-500 hover:text-brand-blue"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs text-ink-500">
                    <p className="flex-1">{loc.address}</p>
                    <button
                      type="button"
                      aria-label="Salin alamat"
                      onClick={async () => {
                        const ok = await copyToClipboard(loc.address);
                        toast[ok ? "success" : "error"](
                          ok ? "Alamat disalin" : "Gagal menyalin alamat"
                        );
                      }}
                      className="shrink-0 rounded p-1 hover:bg-ink-100"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  {loc.description && (
                    <p className="text-xs leading-relaxed text-ink-700">
                      {loc.description}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      }),
    [locations, selectedLocation, flyToLocation]
  );

  if (locations.length > CLUSTER_THRESHOLD) {
    return <MarkerClusterGroup>{markers}</MarkerClusterGroup>;
  }

  return <>{markers}</>;
}