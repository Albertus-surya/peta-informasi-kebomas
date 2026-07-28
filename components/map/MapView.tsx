"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import { LocateFixed } from "lucide-react";
import toast from "react-hot-toast";
import BoundaryLayer from "./BoundaryLayer";
import HighlightLayer from "./HighlightLayer";
import MarkerLayer from "./MarkerLayer";
import { useMapStore } from "@/lib/store/mapStore";
import type { LocationWithCategory } from "@/types/database";
import type { FeatureCollection } from "geojson";

const KELURAHAN_KEBOMAS_KODE = "35.25.14.1010";
const DEFAULT_CENTER: [number, number] = [-7.1621, 112.6381];
const DEFAULT_ZOOM = 15;

function MaxBoundsController({
  bbox,
}: {
  bbox: [number, number, number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!bbox) return;
    const [minLng, minLat, maxLng, maxLat] = bbox;
    map.setMaxBounds([
      [minLat, minLng],
      [maxLat, maxLng],
    ]);
  }, [bbox, map]);

  return null;
}

function FlyToController() {
  const map = useMap();
  const mapCenter = useMapStore((s) => s.mapCenter);

  useEffect(() => {
    if (!mapCenter) return;
    map.flyTo(mapCenter, Math.max(map.getZoom(), 17), {
      animate: true,
      duration: 1.1,
    });
  }, [mapCenter, map]);

  return null;
}

function GeolocateButton({
  boundaryData,
  onLocate,
}: {
  boundaryData: FeatureCollection;
  onLocate: (position: [number, number]) => void;
}) {
  const map = useMap();

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung perangkat ini");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const point = turf.point([longitude, latitude]);
        const isInsideKebomas = boundaryData.features.some((feature) => {
          try {
            return turf.booleanPointInPolygon(point, feature as any);
          } catch {
            return false;
          }
        });

        if (!isInsideKebomas) {
          toast.error("Lokasi Anda berada di luar kawasan Kebomas");
          return;
        }

        onLocate([latitude, longitude]);
        map.flyTo([latitude, longitude], 17, { animate: true });
      },
      () => toast.error("Tidak bisa mengakses lokasi Anda"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [map, boundaryData, onLocate]);

  return (
    <button
      type="button"
      onClick={handleLocate}
      aria-label="Temukan lokasi saya"
      className="absolute bottom-6 right-4 z-[1000] flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-ink-700 shadow-card transition hover:bg-ink-100 sm:hidden"
    >
      <LocateFixed size={18} className="text-brand-blue" />
      Lokasi
    </button>
  );
}

function UserLocationMarker({
  position,
}: {
  position: [number, number] | null;
}) {
  if (!position) return null;

  const icon = L.divIcon({
    className: "kd-user-location-icon",
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.35),0 2px 8px rgba(0,0,0,0.35);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <Marker position={position} icon={icon} interactive={false} zIndexOffset={900}>
      <Tooltip permanent direction="top" offset={[0, -10]} className="kd-tooltip">
        Lokasi Anda
      </Tooltip>
    </Marker>
  );
}

interface MapViewProps {
  boundaryData: FeatureCollection;
  highlightData: FeatureCollection;
  locations: LocationWithCategory[];
}

export default function MapView({
  boundaryData,
  highlightData,
  locations,
}: MapViewProps) {
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        maxBoundsViscosity={1.0}
        minZoom={13}
        maxZoom={19}
        className="h-full w-full"
      >
        <TileLayer
        attribution='Tiles &copy; Esri — Source: Esri'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
        updateWhenIdle={false}
        updateWhenZooming={true}
        />
        <BoundaryLayer
          data={boundaryData}
          onBoundsComputed={setBbox}
          excludeKode={KELURAHAN_KEBOMAS_KODE}
        />
        <HighlightLayer data={highlightData} />
        <MarkerLayer locations={locations} />
        <UserLocationMarker position={userLocation} />
        <MaxBoundsController bbox={bbox} />
        <FlyToController />
        <ZoomControl position="topright" />
        <GeolocateButton boundaryData={boundaryData} onLocate={setUserLocation} />
      </MapContainer>
    </div>
  );
}