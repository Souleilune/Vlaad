"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L, { type DivIcon } from "leaflet";
import { Crosshair, LocateFixed, Navigation, Waves } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { BloodReport, GeoPoint } from "@vlaad/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LiveMapProps = {
  reports: BloodReport[];
  focusedReportId?: string;
  onFocusReport: (reportId: string) => void;
};

const MANILA_CENTER: [number, number] = [14.5995, 120.9842];

function canAnimateMap(map: L.Map) {
  return map.getContainer().isConnected;
}

function safeFlyTo(map: L.Map, center: [number, number], zoom: number, duration: number) {
  if (!canAnimateMap(map)) {
    return;
  }

  map.flyTo(center, zoom, { duration });
}

function hasMapLocation(report: BloodReport | undefined): report is BloodReport {
  return Boolean(
    report &&
      report.location &&
      typeof report.location.lat === "number" &&
      typeof report.location.lng === "number"
  );
}

function createMarkerIcon(report: BloodReport): DivIcon {
  const tone =
    report.intent === "request"
      ? report.isEmergency
        ? "vlaad-map-marker--emergency"
        : "vlaad-map-marker--community"
      : report.intent === "inventory_offer"
        ? "vlaad-map-marker--verified"
        : "vlaad-map-marker--trusted";

  const intentLabel =
    report.intent === "request"
      ? "Need blood"
      : report.intent === "inventory_offer"
        ? "Blood bags available"
        : "Donor available";

  return L.divIcon({
    className: "vlaad-div-icon",
    html: `<div class="vlaad-map-marker ${tone}">${report.bloodType}<span class="sr-only">${intentLabel}</span></div>`,
    iconSize: [42, 52],
    iconAnchor: [21, 50],
    popupAnchor: [0, -44]
  });
}

function MapViewport({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    safeFlyTo(map, center, zoom, 1.2);
  }, [center, map, zoom]);

  return null;
}

function FocusedReportSync({ report }: { report?: BloodReport }) {
  const map = useMap();

  useEffect(() => {
    if (!report) {
      return;
    }

    safeFlyTo(map, [report.location.lat, report.location.lng], Math.max(map.getZoom(), 13), 1);
  }, [map, report]);

  return null;
}

function UserLocationControl({
  onLocationFound
}: {
  onLocationFound: (point: GeoPoint) => void;
}) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!isMountedRef.current) {
          return;
        }

        const point = { lat: coords.latitude, lng: coords.longitude };
        onLocationFound(point);
        safeFlyTo(map, [point.lat, point.lng], 13, 1.2);
        setLocating(false);
      },
      () => {
        if (isMountedRef.current) {
          setLocating(false);
        }
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  return (
    <div className="absolute right-4 top-4 z-[500]">
      <Button variant="secondary" size="sm" onClick={handleLocate} disabled={locating}>
        <LocateFixed className="mr-2 h-4 w-4" />
        {locating ? "Locating..." : "My location"}
      </Button>
    </div>
  );
}

export function LiveMap({ reports, focusedReportId, onFocusReport }: LiveMapProps) {
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const safeReports = useMemo(() => reports.filter((report) => hasMapLocation(report)), [reports]);
  const focusedReport = safeReports.find((report) => report.id === focusedReportId);

  const defaultCenter = useMemo<[number, number]>(() => {
    if (hasMapLocation(focusedReport)) {
      return [focusedReport.location.lat, focusedReport.location.lng];
    }

    if (safeReports.length > 0) {
      return [safeReports[0].location.lat, safeReports[0].location.lng];
    }

    return MANILA_CENTER;
  }, [focusedReport, safeReports]);

  return (
    <div className="relative h-full min-h-[560px]">
      <div className="absolute inset-x-4 top-4 z-[500] flex flex-wrap gap-3">
        <Badge className="bg-white/80 text-slate-700">OpenStreetMap live layer</Badge>
        <Badge className="bg-white/70 text-slate-700">
          <Waves className="mr-1 h-3 w-3" />
          {safeReports.length} active markers
        </Badge>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom
        className="z-10 min-h-[560px]"
        zoomControl={false}
        whenReady={() => setMapReady(true)}
      >
        {mapReady ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : null}

        <MapViewport center={defaultCenter} zoom={12} />
        <FocusedReportSync report={focusedReport} />
        <UserLocationControl onLocationFound={setUserLocation} />

        {userLocation ? (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: "vlaad-div-icon",
              html: '<div class="vlaad-map-marker vlaad-map-marker--trusted">YOU</div>',
              iconSize: [42, 52],
              iconAnchor: [21, 50]
            })}
          >
            <Popup>You are here.</Popup>
          </Marker>
        ) : null}

        {safeReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={createMarkerIcon(report)}
            eventHandlers={{
              click: () => onFocusReport(report.id)
            }}
          >
            <Popup>
              <div className="min-w-56">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Badge
                    className={
                      report.intent === "request"
                        ? "h-14 rounded-[16px] bg-softCoral/15 px-4 text-softCoral"
                        : "h-14 rounded-[16px] bg-pixelSky/35 px-4 text-slate-700"
                    }
                  >
                    {report.intent === "request"
                      ? "Need blood"
                      : report.intent === "inventory_offer"
                        ? "Blood bags available"
                        : "Donor / volunteer available"}
                  </Badge>
                  <span
                    className={
                      report.intent === "request"
                        ? "inline-flex h-14 min-w-[72px] items-center justify-center rounded-[16px] border border-softCoral/25 bg-softCoral px-4 font-display text-xl text-white shadow-[0_10px_22px_rgba(251,113,133,0.22)]"
                        : "inline-flex h-14 min-w-[72px] items-center justify-center rounded-[16px] border border-retroYellow/40 bg-retroYellow px-4 font-display text-xl text-slate-900 shadow-[0_10px_22px_rgba(255,209,102,0.24)]"
                    }
                  >
                    {report.bloodType}
                  </span>
                </div>
                <p className="font-semibold text-slate-900">{report.title}</p>
                <p className="mt-2 text-sm text-slate-500">{report.address}</p>
                {report.nickname || report.contactNumber ? (
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    {report.nickname ? <p><span className="font-medium text-slate-900">Nickname:</span> {report.nickname}</p> : null}
                    {report.contactNumber ? <p><span className="font-medium text-slate-900">Contact:</span> {report.contactNumber}</p> : null}
                  </div>
                ) : null}
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onFocusReport(report.id)}>
                    <Crosshair className="mr-2 h-4 w-4" />
                    Focus
                  </Button>
                  <a
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-900 bg-retroYellow px-3 text-sm font-semibold text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    href={`https://www.openstreetmap.org/?mlat=${report.location.lat}&mlon=${report.location.lng}#map=15/${report.location.lat}/${report.location.lng}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Open
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
