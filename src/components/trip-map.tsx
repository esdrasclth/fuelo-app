"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/lib/geo";

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FitView({
  origin,
  dest,
  geometry,
}: {
  origin: LatLng | null;
  dest: LatLng | null;
  geometry: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = [...geometry];
    if (origin) pts.push([origin.lat, origin.lng]);
    if (dest) pts.push([dest.lat, dest.lng]);
    if (pts.length === 1) {
      map.setView(pts[0], 13);
    } else if (pts.length > 1) {
      map.fitBounds(pts, { padding: [40, 40] });
    }
  }, [map, origin, dest, geometry]);
  return null;
}

export default function TripMap({
  origin,
  dest,
  geometry,
  onPick,
}: {
  origin: LatLng | null;
  dest: LatLng | null;
  geometry: [number, number][];
  onPick: (p: LatLng) => void;
}) {
  return (
    <MapContainer
      center={[19.4326, -99.1332]}
      zoom={11}
      className="h-72 w-full rounded-[var(--radius)] z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <FitView origin={origin} dest={dest} geometry={geometry} />
      {geometry.length > 0 && (
        <Polyline positions={geometry} pathOptions={{ color: "#22c55e", weight: 5 }} />
      )}
      {origin && (
        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={9}
          pathOptions={{ color: "#16a34a", fillColor: "#22c55e", fillOpacity: 1 }}
        >
          <Tooltip permanent direction="top">Origen</Tooltip>
        </CircleMarker>
      )}
      {dest && (
        <CircleMarker
          center={[dest.lat, dest.lng]}
          radius={9}
          pathOptions={{ color: "#dc2626", fillColor: "#ef4444", fillOpacity: 1 }}
        >
          <Tooltip permanent direction="top">Destino</Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
