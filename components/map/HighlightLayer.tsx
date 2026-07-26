"use client";

import { useEffect, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import * as turf from "@turf/turf";
import type { FeatureCollection } from "geojson";
import type L from "leaflet";

interface HighlightLayerProps {
  data: FeatureCollection;
}

/**
 * Menonjolkan polygon Kelurahan Kebomas (pusat kecamatan) dengan style berbeda
 * dari 20 wilayah lain, plus fitBounds otomatis ke polygon ini saat initial load.
 * maxBounds keseluruhan kecamatan (diatur di BoundaryLayer/MapView) tetap berlaku
 * setelahnya — ini murni penekanan visual, bukan pembatasan navigasi.
 */
export default function HighlightLayer({ data }: HighlightLayerProps) {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (hasFlown.current || !data.features.length) return;
    hasFlown.current = true;

    const [minLng, minLat, maxLng, maxLat] = turf.bbox(data);
    map.fitBounds(
      [
        [minLat, minLng],
        [maxLat, maxLng],
      ],
      { padding: [40, 40], animate: true, duration: 1.2 }
    );
  }, [data, map]);

  return (
    <GeoJSON
      data={data as any}
      style={() => ({
        color: "#2563eb",
        weight: 3.5,
        opacity: 1,
        fillColor: "#2563eb",
        fillOpacity: 0.18,
      })}
      onEachFeature={(_feature, layer: L.Layer) => {
        layer.bindTooltip("Kelurahan Kebomas (Pusat Kecamatan)", {
          permanent: true,
          direction: "center",
          className: "kd-highlight-tooltip",
        });
      }}
    />
  );
}
