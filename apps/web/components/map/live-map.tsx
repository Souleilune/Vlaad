"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L, { type DivIcon } from "leaflet";
import { Clock3, LocateFixed, MapPinned, X } from "lucide-react";
import type { BloodReport, GeoPoint } from "@vlaad/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LiveMapProps = {
  reports: BloodReport[];
  focusedReportId?: string;
  routedReportId?: string;
  onOpenReport: (reportId: string) => void;
  onRequestDirections: (reportId: string) => void;
  onClearDirections: () => void;
};

type RouteSummary = {
  distanceMeters: number;
  durationSeconds: number;
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

function getPopupContent(report: BloodReport, isRoutingActive: boolean) {
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
          data-open-report="${report.id}"
          class="inline-flex h-9 items-center justify-center rounded-xl border border-white/40 bg-white/70 px-3 text-sm font-semibold text-slate-700 backdrop-blur-xl transition hover:bg-white"
        >
          View details
        </button>
        <button
          type="button"
          data-route-report="${report.id}"
          class="inline-flex h-9 items-center justify-center rounded-xl border border-softCoral/80 px-3 text-sm font-semibold text-slate-900 transition ${
            isRoutingActive
              ? "bg-softCoral text-white shadow-[0_10px_22px_rgba(251,113,133,0.24)]"
              : "bg-[#fff1ec] hover:bg-[#ffe7e1]"
          }"
        >
          ${isRoutingActive ? "Routing" : "Get direction"}
        </button>
      </div>
    </div>
  `;
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(distanceMeters >= 10_000 ? 0 : 1)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

function formatDuration(durationSeconds: number) {
  const totalMinutes = Math.round(durationSeconds / 60);

  if (totalMinutes < 60) {
    return `${Math.max(totalMinutes, 1)} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}

export function LiveMap({
  reports,
  focusedReportId,
  routedReportId,
  onOpenReport,
  onRequestDirections,
  onClearDirections
}: LiveMapProps) {
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const reportLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const pendingRouteReportIdRef = useRef<string | null>(null);
  const shouldRevealUserMarkerRef = useRef(false);

  const safeReports = useMemo(() => reports.filter((report) => hasMapLocation(report)), [reports]);
  const focusedReport = safeReports.find((report) => report.id === focusedReportId);
  const routedReport = safeReports.find((report) => report.id === routedReportId);

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
      if (pendingRouteReportIdRef.current) {
        setRouteLoading(false);
        setRouteSummary(null);
        setRouteError("We need your current location to build directions.");
      }
    };

    map.on("locationfound", handleLocationFound);
    map.on("locationerror", handleLocationError);

    return () => {
      map.off("locationfound", handleLocationFound);
      map.off("locationerror", handleLocationError);
      reportLayerRef.current?.clearLayers();
      reportLayerRef.current = null;
      routeLayerRef.current = null;
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

      marker.bindPopup(getPopupContent(report, report.id === routedReportId));
      marker.on("click", () => onOpenReport(report.id));
      marker.on("popupopen", () => {
        const popupRoot = document.querySelector(`[data-report-popup="${report.id}"]`);
        const openButton = popupRoot?.querySelector<HTMLButtonElement>(`[data-open-report="${report.id}"]`);
        const routeButton = popupRoot?.querySelector<HTMLButtonElement>(`[data-route-report="${report.id}"]`);

        if (openButton) {
          openButton.onclick = () => onOpenReport(report.id);
        }

        if (routeButton) {
          routeButton.onclick = () => onRequestDirections(report.id);
        }
      });

      marker.addTo(reportLayer);
    });
  }, [onOpenReport, onRequestDirections, routedReportId, safeReports]);

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
    if (routedReport) {
      return;
    }

    pendingRouteReportIdRef.current = null;
    setRouteLoading(false);
    setRouteError(null);
    setRouteSummary(null);

    const map = mapRef.current;
    if (map && routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
  }, [routedReport]);

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
      html: '<div class="vlaad-map-marker vlaad-map-marker--trusted">You</div>',
      iconSize: [42, 52],
      iconAnchor: [21, 50]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      userMarkerRef.current.setIcon(markerIcon);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: markerIcon,
        zIndexOffset: 1000
      })
        .addTo(map)
        .bindPopup("You are here.");
    }

    if (shouldRevealUserMarkerRef.current) {
      userMarkerRef.current?.openPopup();
      shouldRevealUserMarkerRef.current = false;
    }
  }, [userLocation]);

  const handleLocate = () => {
    const map = mapRef.current;

    if (!map) {
      setLocationError("Map is still loading.");
      setRouteLoading(false);
      return;
    }

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported in this browser.");
      setRouteLoading(false);
      setRouteError("Geolocation is not supported in this browser.");
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

  useEffect(() => {
    const handleExternalLocate = () => {
      shouldRevealUserMarkerRef.current = true;
      handleLocate();
    };

    window.addEventListener("agos-bd:locate-user", handleExternalLocate as EventListener);

    return () => {
      window.removeEventListener("agos-bd:locate-user", handleExternalLocate as EventListener);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !routedReport) {
      return;
    }

    if (!userLocation) {
      pendingRouteReportIdRef.current = routedReport.id;
      shouldRevealUserMarkerRef.current = true;
      setRouteLoading(true);
      setRouteError(null);
      handleLocate();
      return;
    }

    pendingRouteReportIdRef.current = null;
    shouldRevealUserMarkerRef.current = true;

    const abortController = new AbortController();
    const loadRoute = async () => {
      setRouteLoading(true);
      setRouteError(null);
      setRouteSummary(null);

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${routedReport.location.lng},${routedReport.location.lat}?overview=full&geometries=geojson`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error("Route service is unavailable.");
        }

        const payload = (await response.json()) as {
          code?: string;
          routes?: Array<{
            distance: number;
            duration: number;
            geometry?: { coordinates?: [number, number][] };
          }>;
        };

        const route = payload.routes?.[0];
        const coordinates = route?.geometry?.coordinates;

        if (payload.code !== "Ok" || !route || !coordinates?.length) {
          throw new Error("No route was returned for this destination.");
        }

        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
        }

        const latLngs = coordinates.map(([lng, lat]) => [lat, lng] as L.LatLngTuple);
        routeLayerRef.current = L.polyline(latLngs, {
          color: "#f43f5e",
          weight: 6,
          opacity: 0.88
        }).addTo(map);

        userMarkerRef.current?.openPopup();

        map.fitBounds(routeLayerRef.current.getBounds(), {
          paddingTopLeft: [40, 40],
          paddingBottomRight: [40, 180]
        });

        setRouteSummary({
          distanceMeters: route.distance,
          durationSeconds: route.duration
        });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }

        setRouteSummary(null);
        setRouteError(error instanceof Error ? error.message : "Unable to load directions right now.");
      } finally {
        if (!abortController.signal.aborted) {
          setRouteLoading(false);
        }
      }
    };

    void loadRoute();

    return () => {
      abortController.abort();
    };
  }, [routedReport, userLocation]);

  useEffect(() => {
    if (pendingRouteReportIdRef.current && userLocation) {
      setRouteError(null);
    }
  }, [userLocation]);

  return (
    <div className="absolute inset-0">
      <div className="absolute right-4 top-4 z-[500] flex flex-col items-end gap-2">
        <Button variant="secondary" size="sm" className="rounded-2xl" onClick={handleLocate} disabled={locating}>
          <LocateFixed className="mr-2 h-4 w-4" />
          {locating ? "Locating..." : "My location"}
        </Button>
      </div>

      <div className="absolute right-4 top-28 z-[500] flex flex-col items-end gap-2 sm:top-32">
        {userLocation ? (
          <div className="max-w-xs rounded-2xl border border-white/60 bg-white/90 px-3 py-2 text-right text-xs text-slate-600 shadow-glass backdrop-blur-xl">
            <span className="font-semibold text-slate-900">You</span> marks your current location on the map.
          </div>
        ) : null}
        {locationError ? (
          <div className="max-w-xs rounded-2xl border border-softCoral/25 bg-white/90 px-3 py-2 text-right text-xs text-softCoral shadow-glass backdrop-blur-xl">
            {locationError}
          </div>
        ) : null}
      </div>

      <div className="absolute bottom-4 right-4 z-[500] flex flex-col items-end gap-2">
        {routedReport ? (
          <div className="max-w-sm rounded-2xl border border-white/60 bg-white/92 p-3 shadow-glass backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Directions</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{routedReport.title}</p>
                <p className="mt-1 text-xs text-slate-500">{routedReport.address}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-2xl" onClick={onClearDirections} aria-label="Clear directions">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-softCoral/10 text-softCoral">
                <MapPinned className="mr-1 h-3 w-3" />
                {routeLoading && !routeSummary ? "Finding route..." : routedReport.bloodType}
              </Badge>
              {routeSummary ? (
                <>
                  <Badge className="bg-sky-100 text-sky-800">{formatDistance(routeSummary.distanceMeters)}</Badge>
                  <Badge className="bg-slate-100 text-slate-700">
                    <Clock3 className="mr-1 h-3 w-3" />
                    {formatDuration(routeSummary.durationSeconds)}
                  </Badge>
                </>
              ) : null}
            </div>

            {routeError ? (
              <p className="mt-3 text-xs text-softCoral">{routeError}</p>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                {routeLoading
                  ? "Using your current location as the starting point."
                  : "Route starts from your current location."}
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div ref={mapContainerRef} className="absolute inset-0 z-10" />
    </div>
  );
}
