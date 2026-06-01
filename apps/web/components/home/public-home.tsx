"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpenText, ChevronDown, ClipboardPlus, LocateFixed, MapPinned, Search, ShieldCheck } from "lucide-react";
import { PublicAnnouncementStrip, PublicAnnouncements } from "@/components/home/public-announcements";
import { ReportModal } from "@/components/reports/report-modal";
import { MapShell } from "@/components/map/map-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PublicHome() {
  const [introVisible, setIntroVisible] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [locatingFromStarter, setLocatingFromStarter] = useState(false);
  const [starterLocationMessage, setStarterLocationMessage] = useState<string | null>(null);
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const guideSectionRef = useRef<HTMLElement | null>(null);
  const locationMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!locationMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!locationMenuRef.current?.contains(event.target as Node)) {
        setLocationMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [locationMenuOpen]);

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuickStart = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIntroVisible(false);
    setLocationMenuOpen(false);
    scrollToMap();
  };

  const triggerMapLocation = () => {
    window.dispatchEvent(new CustomEvent("agos-bd:locate-user"));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStarterLocationMessage("Geolocation is not available on this device.");
      setLocationMenuOpen(false);
      return;
    }

    setLocatingFromStarter(true);
    setStarterLocationMessage(null);
    setLocationMenuOpen(false);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setQuickSearch(`Current location (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)})`);
        setLocatingFromStarter(false);
        setStarterLocationMessage("Using your current location on the live map.");
        setIntroVisible(false);
        scrollToMap();
        window.setTimeout(() => {
          triggerMapLocation();
        }, 120);
      },
      () => {
        setLocatingFromStarter(false);
        setStarterLocationMessage("We couldn't get your location. You can still type it manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff8f7_0%,#fdf4f1_46%,#faefea_100%)] px-4 py-5 sm:px-6 lg:px-8">
      <ReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,0,0,0.16),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(232,82,74,0.2),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(245,166,35,0.12),transparent_24%)]" />
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(255,255,255,0.08),transparent)]" />
        <div className="absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-deepCrimson/10 blur-3xl" />
        <div className="absolute right-[-5rem] top-40 h-72 w-72 rounded-full bg-softCoral/14 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/2 h-52 w-[32rem] -translate-x-1/2 rounded-full bg-softGold/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.22]" style={{ backgroundImage: "linear-gradient(rgba(139,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,0,0,0.08) 1px, transparent 1px)", backgroundSize: "72px 72px", maskImage: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 82%)" }} />
      </div>

      <header className="sticky top-0 z-50 -mx-4 border-b border-deepCrimson/10 bg-[#fffaf7]/92 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6">
          <button type="button" className="shrink-0 text-left" onClick={scrollToMap}>
            <span className="font-display text-2xl font-semibold tracking-[-0.045em] text-slate-950">
              AGOS-BD<span className="align-super text-[0.55rem] font-semibold tracking-normal text-deepCrimson/55">PH</span>
            </span>
          </button>

          <nav className="hidden items-center gap-9 text-xs font-semibold text-slate-500 md:flex" aria-label="Public navigation">
            <button type="button" className="transition hover:text-slate-950" onClick={scrollToMap}>
              Home
            </button>
            <button type="button" className="transition hover:text-slate-950" onClick={() => setReportModalOpen(true)}>
              Report
            </button>
            <button type="button" className="transition hover:text-slate-950" onClick={() => guideSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              Guide
            </button>
            <Link className="transition hover:text-slate-950" href="/register">
              Register
            </Link>
            <Link className="transition hover:text-slate-950" href="/login">
              Login
            </Link>
          </nav>

          <Button
            className="h-9 rounded-full px-5 text-xs shadow-none hover:shadow-none"
            size="sm"
            onClick={() => {
              setIntroVisible(false);
              scrollToMap();
            }}
          >
            Begin Journey
          </Button>
        </div>

        <div className="mx-auto flex w-full max-w-6xl items-center gap-5 overflow-x-auto pb-3 text-xs font-semibold text-slate-500 md:hidden">
          <button type="button" className="shrink-0 transition hover:text-slate-950" onClick={scrollToMap}>
            Home
          </button>
          <button type="button" className="shrink-0 transition hover:text-slate-950" onClick={() => setReportModalOpen(true)}>
            Report
          </button>
          <button type="button" className="shrink-0 transition hover:text-slate-950" onClick={() => guideSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            Guide
          </button>
          <Link className="shrink-0 transition hover:text-slate-950" href="/register">
            Register
          </Link>
          <Link className="shrink-0 transition hover:text-slate-950" href="/login">
            Login
          </Link>
        </div>
      </header>

      <section className="relative flex flex-col gap-6 pt-2" aria-label="Public blood request and availability map">
        <section ref={mapSectionRef} className="relative mx-auto w-full max-w-6xl">
          <div className={introVisible ? "pointer-events-none select-none blur-[3px] saturate-[0.75]" : ""}>
            <MapShell layout="stacked" onCreateReport={() => setReportModalOpen(true)} />
          </div>

          {introVisible ? (
            <div className="absolute inset-0 z-[700] flex items-start justify-center rounded-[2rem] bg-cleanWhite/18 px-4 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-24">
              <Card className="w-full max-w-xl rounded-[2.25rem] border-cleanWhite/45 bg-cleanWhite/52 px-6 py-7 text-center shadow-[0_24px_70px_rgba(139,0,0,0.14)] backdrop-blur-xl sm:px-10 sm:py-9">
                <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-deepCrimson sm:text-5xl">
                  Start With The Map
                </h1>
                <p className="mt-5 text-base leading-8 text-deepCrimson/72">
                  See blood requests, donor offers, and verified availability on one live map. Start with a place, hospital, city, or blood type, then explore the map with more confidence.
                </p>

                <form className="mt-7" onSubmit={handleQuickStart}>
                  <div className="flex items-center rounded-full border border-softCoral/10 bg-[#f7f2ee] px-2 py-2 shadow-neuInset">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8f3ef] text-softCoral shadow-neuSoft">
                      <LocateFixed className="h-6 w-6" />
                    </div>
                    <Input
                      value={quickSearch}
                      onChange={(event) => setQuickSearch(event.target.value)}
                      placeholder="Search location, hospital, city, or blood type"
                      className="h-12 border-0 bg-transparent px-2 text-base shadow-none focus:ring-0"
                    />
                    <div className="relative mr-2" ref={locationMenuRef}>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center gap-1 rounded-full border border-softCoral/10 bg-[#f8f3ef] px-3 text-sm font-semibold text-deepCrimson shadow-neuSoft transition hover:-translate-y-0.5"
                        onClick={() => setLocationMenuOpen((current) => !current)}
                        aria-expanded={locationMenuOpen}
                        aria-label="Location options"
                      >
                        <LocateFixed className="h-4 w-4 text-softCoral" />
                        <ChevronDown className={`h-4 w-4 transition-transform ${locationMenuOpen ? "rotate-180" : ""}`} />
                      </button>

                      {locationMenuOpen ? (
                        <div className="absolute right-0 top-12 z-20 min-w-56 rounded-[1.25rem] border border-cleanWhite/45 bg-cleanWhite/80 p-2 shadow-[0_18px_42px_rgba(139,0,0,0.14)] backdrop-blur-xl">
                          <button
                            type="button"
                            className="flex w-full items-center rounded-[1rem] px-3 py-3 text-left text-sm font-semibold text-deepCrimson transition hover:bg-softCoral/10"
                            onClick={useMyLocation}
                            disabled={locatingFromStarter}
                          >
                            <LocateFixed className="mr-2 h-4 w-4 text-softCoral" />
                            {locatingFromStarter ? "Getting your location..." : "Use my current location"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <Button type="submit" size="icon" className="h-12 w-12 rounded-full shadow-neuSoft">
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                </form>

                {starterLocationMessage ? (
                  <p className="mt-3 text-sm text-deepCrimson/62">{starterLocationMessage}</p>
                ) : null}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={() => setIntroVisible(false)}>Open live map</Button>
                  <Button variant="secondary" onClick={() => guideSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                    View guide first
                  </Button>
                  <Button variant="pixel" onClick={() => setReportModalOpen(true)}>
                    <ClipboardPlus className="mr-2 h-4 w-4" />
                    Post update
                  </Button>
                </div>
              </Card>
            </div>
          ) : null}
        </section>

        <PublicAnnouncementStrip />

        <section ref={guideSectionRef} className="mx-auto w-full max-w-6xl">
          <Card className="rounded-[2rem] border-softCoral/10 bg-[#f8f3ef] p-6 shadow-neu sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                {/* <Badge className="bg-softGold/20 text-deepCrimson">Guide Next</Badge> */}
                <h2 className="mt-4 text-3xl font-bold text-deepCrimson sm:text-[2.15rem]">
                  Learn the flow before you explore.
                </h2>
                <p className="mt-3 text-sm leading-7 text-deepCrimson/72 sm:text-base">
                  AGOS-BD works best when people follow a simple rhythm: check the map, open the details, then act only after confirming the need.
                </p>
              </div>
              {!introVisible ? (
                <Button variant="secondary" onClick={() => setIntroVisible(true)}>
                  Show starter overlay again
                </Button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              <div className="rounded-[1.5rem] border border-softCoral/10 bg-[#faf6f2] p-4 shadow-neuSoft">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[#f8f3ef] p-3 text-softCoral shadow-neuSoft">
                    <MapPinned className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-deepCrimson/42">Step 1</p>
                    <p className="mt-1 text-lg font-bold text-deepCrimson">Check the live map first</p>
                    <p className="mt-1 text-sm leading-6 text-deepCrimson/68">Start with location and urgency so you can understand what is happening nearby.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-softCoral/10 bg-[#faf6f2] p-4 shadow-neuSoft">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[#f8f3ef] p-3 text-softGold shadow-neuSoft">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-deepCrimson/42">Step 2</p>
                    <p className="mt-1 text-lg font-bold text-deepCrimson">Open the report details</p>
                    <p className="mt-1 text-sm leading-6 text-deepCrimson/68">Confirm the blood type, contact information, expiry time, and trust signals before acting.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-softCoral/10 bg-[#faf6f2] p-4 shadow-neuSoft">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[#f8f3ef] p-3 text-deepCrimson shadow-neuSoft">
                    <BookOpenText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-deepCrimson/42">Step 3</p>
                    <p className="mt-1 text-lg font-bold text-deepCrimson">Post only when you&apos;re sure</p>
                    <p className="mt-1 text-sm leading-6 text-deepCrimson/68">Use the form when you have a real request, verified donor offer, or confirmed availability update.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <PublicAnnouncements />

        {/* <footer className="relative left-1/2 w-screen -translate-x-1/2 bg-deepCrimson text-cleanWhite">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-10">
            <div>
              <div className="inline-flex rounded-[1.25rem] border border-cleanWhite/12 bg-[rgba(255,255,255,0.06)] px-4 py-3 shadow-[6px_6px_16px_rgba(54,0,0,0.24),-4px_-4px_12px_rgba(168,22,22,0.18)]">
                <span className="text-lg font-extrabold tracking-[0.08em]">AGOS-BD</span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-7 text-cleanWhite/76">
                Adaptive Geo-mapped Outreach System for Blood Donations. Built to help communities surface urgent blood needs, verified supply, and clearer donation response.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-cleanWhite/72">Quick Access</p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <button type="button" className="text-left text-cleanWhite/82 transition hover:text-cleanWhite" onClick={() => setIntroVisible(true)}>
                  Starter overlay
                </button>
                <button type="button" className="text-left text-cleanWhite/82 transition hover:text-cleanWhite" onClick={() => guideSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                  Guide
                </button>
                <button type="button" className="text-left text-cleanWhite/82 transition hover:text-cleanWhite" onClick={() => setReportModalOpen(true)}>
                  Post update
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-cleanWhite/72">Access</p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <Link href="/register" className="text-cleanWhite/82 transition hover:text-cleanWhite">
                  Create account
                </Link>
                <Link href="/login" className="text-cleanWhite/82 transition hover:text-cleanWhite">
                  Sign in
                </Link>
                <p className="text-cleanWhite/62">Public map stays available for guests.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-cleanWhite/10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-xs text-cleanWhite/62 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <p>Project AGOS-BD</p>
              <p>Community blood request and availability coordination</p>
            </div>
          </div>
        </footer> */}
      </section>
    </main>
  );
}
