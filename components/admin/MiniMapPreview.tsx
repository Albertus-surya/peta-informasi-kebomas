"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

const pinIcon = L.divIcon({
  html: `<div style="width:22px;height:22px;border-radius:9999px;background:#2563eb;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface MiniMapPreviewProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

function RecenterOnChange({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

function ClickToPlace({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MiniMapPreview({
  latitude,
  longitude,
  onChange,
}: MiniMapPreviewProps) {
  const validPos: [number, number] =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? [latitude, longitude]
      : [-7.1621, 112.6381];

  return (
    <div className="h-52 w-full overflow-hidden rounded-lg border border-ink-300">
      <MapContainer
        center={validPos}
        zoom={16}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={validPos}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const { lat, lng } = marker.getLatLng();
              onChange(lat, lng);
            },
          }}
        />
        <ClickToPlace onChange={onChange} />
        <RecenterOnChange lat={validPos[0]} lng={validPos[1]} />
      </MapContainer>
      <p className="mt-1 text-[11px] text-ink-500">
        Klik peta atau geser pin untuk mengatur koordinat.
      </p>
    </div>
  );
}
