"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: { lat: number; lng: number }; // Tambahan prop untuk mode Edit
}

// Komponen kecil untuk menggeser kamera peta secara otomatis
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16); // Zoom level 16 agar lumayan dekat
  }, [lat, lng, map]);
  return null;
}

export default function MapPicker({
  onLocationSelect,
  initialPosition,
}: MapPickerProps) {
  // Set posisi awal jika ada (mode edit), jika tidak pakai default
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialPosition && initialPosition.lat !== 0 ? initialPosition : null,
  );

  const centerLat = initialPosition?.lat || -7.8897;
  const centerLng = initialPosition?.lng || 110.3289;

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });

    return position === null ? null : <Marker position={position}></Marker>;
  };

  return (
    <div className="h-[300px] w-full rounded-none border border-transparent z-0 relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Jika mode edit dan koordinat valid, geser kamera kesana */}
        {initialPosition && initialPosition.lat !== 0 && (
          <RecenterMap lat={initialPosition.lat} lng={initialPosition.lng} />
        )}
        <LocationMarker />
      </MapContainer>
    </div>
  );
}
