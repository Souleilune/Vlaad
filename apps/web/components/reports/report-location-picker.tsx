"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

type ReportLocationPickerProps = {
  latitude: number;
  longitude: number;
  onPick: (point: { lat: number; lng: number }) => void;
};

const pinIcon = L.divIcon({
  className: "vlaad-div-icon",
  html: '<div class="vlaad-map-marker vlaad-map-marker--trusted">PIN</div>',
  iconSize: [42, 52],
  iconAnchor: [21, 50]
});

function MapClickSync({
  latitude,
  longitude,
  onPick
}: ReportLocationPickerProps) {
  const map = useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });

  useEffect(() => {
    map.setView([latitude, longitude], Math.max(map.getZoom(), 15), { animate: true });
  }, [latitude, longitude, map]);

  return null;
}

export function ReportLocationPicker({
  latitude,
  longitude,
  onPick
}: ReportLocationPickerProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/60 bg-white/75">
      <div className="border-b border-slate-100 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500">
        Tap map to move the pin
      </div>
      <div className="h-64">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickSync latitude={latitude} longitude={longitude} onPick={onPick} />
          <Marker position={[latitude, longitude]} icon={pinIcon} />
        </MapContainer>
      </div>
    </div>
  );
}
