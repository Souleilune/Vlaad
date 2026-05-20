"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ClipboardPlus, LogIn, UserPlus } from "lucide-react";
import { PublicAnnouncementStrip, PublicAnnouncements } from "@/components/home/public-announcements";
import { ReportModal } from "@/components/reports/report-modal";
import { MapShell } from "@/components/map/map-shell";
import { Button } from "@/components/ui/button";

export function PublicHome() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const openNav = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      setNavExpanded(true);
    }, 220);
  };

  const closeNav = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    setNavExpanded(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <ReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/45 via-white/10 to-transparent" />

      <header className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2">
        <div
          className={`pointer-events-auto rounded-full border border-white/55 bg-white/80 shadow-glass backdrop-blur-xl transition-[width,box-shadow,background-color] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            navExpanded ? "w-[min(52rem,calc(100vw-2rem))]" : "w-auto"
          }`}
          onMouseEnter={openNav}
          onMouseLeave={closeNav}
        >
          <div
            className={`flex items-center px-4 py-3 ${
              navExpanded ? "justify-between gap-4" : "justify-center gap-0"
            }`}
          >
            <button
              type="button"
              className="flex items-center text-left"
              onClick={() => setNavExpanded((current) => !current)}
              aria-expanded={navExpanded}
              aria-label={navExpanded ? "Collapse navigation" : "Expand navigation"}
            >
              <span className="font-display text-2xl text-slate-900">Vlaad</span>
            </button>

            <div
              className={`overflow-hidden transition-[max-width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                navExpanded ? "max-w-[42rem]" : "max-w-0"
              }`}
              aria-hidden={!navExpanded}
            >
              <div
                className={`flex items-center gap-2 whitespace-nowrap transition-[opacity,transform,padding] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  navExpanded
                    ? "translate-x-0 pl-3 opacity-100 delay-200 duration-700"
                    : "translate-x-3 pl-0 opacity-0 delay-0 duration-250"
                }`}
              >
                <Button variant="pixel" size="sm" onClick={() => setReportModalOpen(true)}>
                  <ClipboardPlus className="mr-2 h-4 w-4" />
                  Create a report
                </Button>
                <Link href="/register" onClick={closeNav}>
                  <Button variant="secondary" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </Button>
                </Link>
                <Link href="/login" onClick={closeNav}>
                  <Button size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-6 pt-20" aria-label="Public blood request and availability map">
        <PublicAnnouncementStrip />
        <MapShell layout="stacked" onCreateReport={() => setReportModalOpen(true)} />
        <PublicAnnouncements />
      </section>
    </main>
  );
}
