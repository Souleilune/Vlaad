"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L, { type DivIcon } from "leaflet";
import { LocateFixed, Waves } from "lucide-react";
import type { BloodReport, GeoPoint } from "@vlaad/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LiveMapProps = {
  reports: BloodReport[];
  focusedReportId?: string;
  onFocusReport: (reportId: string) => void;
};

const MANILA_CENTER: [number, number] = [14.5995, 120.9842];
const MAP_ZOOM = 12;

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

function getPopupContent(report: BloodReport) {
  const badgeLabel =
    report.intent === "request"
      ? "Need blood"
      : report.intent === "inventory_offer"
        ? "Blood bags available"
        : "Donor / volunteer available";

  const badgeClasses =
    report.intent === "request"
      ? "h-14 rounded-[16px] bg-softCoral/15 px-4 text-softCoral"
      : "h-14 rounded-[16px] bg-pixelSky/35 px-4 text-slate-700";

  const bloodTypeClasses =
    report.intent === "request"
      ? "inline-flex h-14 min-w-[72px] items-center justify-center rounded-[16px] border border-softCoral/25 bg-softCoral px-4 font-display text-xl text-white shadow-[0_10px_22px_rgba(251,113,133,0.22)]"
      : "inline-flex h-14 min-w-[72px] items-center justify-center rounded-[16px] border border-retroYellow/40 bg-retroYellow px-4 font-display text-xl text-slate-900 shadow-[0_10px_22px_rgba(255,209,102,0.24)]";

  const contactBlock =
    report.nickname || report.contactNumber
      ? `<div class="mt-3 space-y-1 text-sm text-slate-600">
          ${report.nickname ? `<p><span class="font-medium text-slate-900">Nickname:</span> ${report.nickname}</p>` : ""}
          ${report.contactNumber ? `<p><span class="font-medium text-slate-900">Contact:</span> ${report.contactNumber}</p>` : ""}
        </div>`
      : "";

  return `
    <div class="min-w-56" data-report-popup="${report.id}">
      <div class="mb-2 flex items-center justify-between gap-3">
        <span class="inline-flex items-center ${badgeClasses}">${badgeLabel}</span>
        <span class="${bloodTypeClasses}">${report.bloodType}</span>
      </div>
      <p class="font-semibold text-slate-900">${report.title}</p>
      <p class="mt-2 text-sm text-slate-500">${report.address}</p>
      ${contactBlock}
      <div class="mt-4 flex gap-2">
        <button
          type="button"
          data-focus-report="${report.id}"
          class="inline-flex h-9 items-center justify-center rounded-xl border border-white/40 bg-white/70 px-3 text-sm font-semibold text-slate-700 backdrop-blur-xl transition hover:bg-white"
        >
          Focus
        </button>
        <a
          class="inline-flex h-9 items-center justify-center rounded-xl border border-softCoral/80 bg-[#fff1ec] px-3 text-sm font-semibold text-slate-900 shadow-[4px_4px_0px_0px_rgba(251,113,133,0.42)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#ffe7e1] hover:shadow-none"
          href="https://www.openstreetmap.org/?mlat=${report.location.lat}&mlon=${report.location.lng}#map=15/${report.location.lat}/${report.location.lng}"
          rel="noreferrer"
          target="_blank"
        >
          Open
        </a>
      </div>
    </div>
  `;
}

export function LiveMap({ reports, focusedReportId, onFocusReport }: LiveMapProps) {
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const reportLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const safeReports = useMemo(() => reports.filter((report) => hasMapLocation(report)), [reports]);
  const focusedReport = safeReports.find((report) => report.id === focusedReportId);

  const defaultCenter = useMemo<[number, number]>(() => {
    if (hasMapLocation(focusedReport)) {
      return [focusedReport.location.lat, focusedReport.location.lng];
    }

    const firstReport = safeReports[0];
    if (firstReport) {
      return [firstReport.location.lat, firstReport.location.lng];
    }

    return MANILA_CENTER;
  }, [focusedReport, safeReports]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) {
      return;
    }

    const map = L.map(container, {
      center: defaultCenter,
      zoom: MAP_ZOOM,
      zoomControl: false,
      scrollWheelZoom: true
    });

    const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    tileLayer.addTo(map);

    mapRef.current = map;
    tileLayerRef.current = tileLayer;
    reportLayerRef.current = L.layerGroup().addTo(map);

    const handleLocationFound = (event: L.LocationEvent) => {
      const point = { lat: event.latlng.lat, lng: event.latlng.lng };
      setUserLocation(point);
      setLocating(false);
      setLocationError(null);
      map.flyTo([point.lat, point.lng], 13, { duration: 1.2 });
    };

    const handleLocationError = (event: L.ErrorEvent) => {
      setLocating(false);
      setLocationError(event.message || "Unable to access your location.");
    };

    map.on("locationfound", handleLocationFound);
    map.on("locationerror", handleLocationError);

    return () => {
      map.off("locationfound", handleLocationFound);
      map.off("locationerror", handleLocationError);
      reportLayerRef.current?.clearLayers();
      reportLayerRef.current = null;
      tileLayerRef.current = null;
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [defaultCenter]);

  useEffect(() => {
    const map = mapRef.current;
    const reportLayer = reportLayerRef.current;

    if (!map || !reportLayer) {
      return;
    }

    reportLayer.clearLayers();

    safeReports.forEach((report) => {
      const marker = L.marker([report.location.lat, report.location.lng], {
        icon: createMarkerIcon(report)
      });

      marker.bindPopup(getPopupContent(report));
      marker.on("click", () => onFocusReport(report.id));
      marker.on("popupopen", () => {
        const popupRoot = document.querySelector(`[data-report-popup="${report.id}"]`);
        const focusButton = popupRoot?.querySelector<HTMLButtonElement>(`[data-focus-report="${report.id}"]`);

        if (focusButton) {
          focusButton.onclick = () => onFocusReport(report.id);
        }
      });

      marker.addTo(reportLayer);
    });
  }, [onFocusReport, safeReports]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.flyTo(defaultCenter, MAP_ZOOM, { duration: 1.2 });
  }, [defaultCenter]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !focusedReport) {
      return;
    }

    map.flyTo([focusedReport.location.lat, focusedReport.location.lng], Math.max(map.getZoom(), 13), {
      duration: 1
    });
  }, [focusedReport]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (!userLocation) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      return;
    }

    const markerIcon = L.divIcon({
      className: "vlaad-div-icon",
      html: '<div class="vlaad-map-marker vlaad-map-marker--trusted">YOU</div>',
      iconSize: [42, 52],
      iconAnchor: [21, 50]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      userMarkerRef.current.setIcon(markerIcon);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: markerIcon
      })
        .addTo(map)
        .bindPopup("You are here.");
    }
  }, [userLocation]);

  const handleLocate = () => {
    const map = mapRef.current;

    if (!map) {
      setLocationError("Map is still loading.");
      return;
    }

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    setLocationError(null);
    map.locate({
      setView: false,
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60_000
    });
  };

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-4 top-4 z-[500] flex flex-wrap gap-3">
        <Badge className="bg-white/80 text-slate-700">OpenStreetMap live layer</Badge>
        <Badge className="bg-white/70 text-slate-700">
          <Waves className="mr-1 h-3 w-3" />
          {safeReports.length} active markers
        </Badge>
      </div>

      <div className="absolute right-4 top-4 z-[500] flex flex-col items-end gap-2">
        <Button variant="secondary" size="sm" onClick={handleLocate} disabled={locating}>
          <LocateFixed className="mr-2 h-4 w-4" />
          {locating ? "Locating..." : "My location"}
        </Button>
        {locationError ? (
          <div className="max-w-xs rounded-2xl border border-softCoral/25 bg-white/90 px-3 py-2 text-right text-xs text-softCoral shadow-glass backdrop-blur-xl">
            {locationError}
          </div>
        ) : null}
      </div>

      <div ref={mapContainerRef} className="absolute inset-0 z-10" />
    </div>
  );
}
