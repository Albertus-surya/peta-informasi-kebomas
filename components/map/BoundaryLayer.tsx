"use client";

import { useEffect, useState } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import * as turf from "@turf/turf";
import type { Feature, FeatureCollection } from "geojson";
import type L from "leaflet";

interface BoundaryLayerProps {
  data: FeatureCollection;
  /** Dipanggil sekali dengan bbox terhitung, dipakai parent untuk maxBounds */
  onBoundsComputed?: (bbox: [number, number, number, number]) => void;
  /** kode_kd Kelurahan Kebomas — dikecualikan dari style default sebab sudah
   * digambar terpisah & lebih menonjol oleh <HighlightLayer /> */
  excludeKode?: string;
}

/**
 * Menggambar boundary 20 kelurahan/desa (semua kecuali Kelurahan Kebomas) dan
 * menghitung bounding box kecamatan secara otomatis dari isi file GeoJSON
 * (bukan hardcode) — dipakai parent untuk map.setMaxBounds().
 */
export default function BoundaryLayer({
  data,
  onBoundsComputed,
  excludeKode = "35.25.14.1010",
}: BoundaryLayerProps) {
  const map = useMap();
  const [reportedBounds, setReportedBounds] = useState(false);

  useEffect(() => {
    if (reportedBounds || !data.features.length) return;
    const [minLng, minLat, maxLng, maxLat] = turf.bbox(data);
    const padding = 0.005;
    const bbox: [number, number, number, number] = [
      minLng - padding,
      minLat - padding,
      maxLng + padding,
      maxLat + padding,
    ];
    onBoundsComputed?.(bbox);
    setReportedBounds(true);
  }, [data, onBoundsComputed, reportedBounds]);

  const visibleFeatures: FeatureCollection = {
    type: "FeatureCollection",
    features: data.features.filter(
      (f: Feature) => f.properties?.kode_kd !== excludeKode
    ),
  };

  return (
    <GeoJSON
      data={visibleFeatures as any}
      style={() => ({
        color: "#f97316",
        weight: 2,
        opacity: 0.9,
        fillColor: "#f97316",
        fillOpacity: 0.05,
      })}
      onEachFeature={(feature: Feature, layer: L.Layer) => {
        const nama = feature.properties?.nama ?? feature.properties?.label;
        if (nama) {
          layer.bindTooltip(nama, {
            sticky: true,
            direction: "top",
            className: "kd-tooltip",
          });
        }
        layer.on({
          mouseover: (e) => {
            (e.target as L.Path).setStyle({ fillOpacity: 0.15 });
          },
          mouseout: (e) => {
            (e.target as L.Path).setStyle({ fillOpacity: 0.05 });
          },
        });
      }}
    />
  );
}
