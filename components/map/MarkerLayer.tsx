"use client";

import { useMemo } from "react";
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

function buildDivIcon(iconName: string, active: boolean) {
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
        background: active ? "#2563eb" : "#f97316",
        border: "2px solid white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
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
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);

  const markers = useMemo(
    () =>
      locations.map((loc) => {
        const isActive = selectedLocation?.id === loc.id;
        const icon = buildDivIcon(loc.categories?.icon ?? "MapPin", isActive);

        return (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => setSelectedLocation(loc),
            }}
          >
            <Popup>
              <div className="w-full animate-fade-in">
                {loc.image_url && (
                  <img
                    src={loc.image_url}
                    alt={`Foto ${loc.name}`}
                    className="h-32 w-full object-cover"
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
    [locations, selectedLocation, setSelectedLocation]
  );

  if (locations.length > CLUSTER_THRESHOLD) {
    return <MarkerClusterGroup>{markers}</MarkerClusterGroup>;
  }

  return <>{markers}</>;
}
