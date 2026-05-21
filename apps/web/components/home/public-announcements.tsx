"use client";

import { useEffect, useState } from "react";
import type { PublicAnnouncement } from "@vlaad/shared";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { usePublicAnnouncements } from "@/hooks/use-public-announcements";

function formatAnnouncementDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function buildTickerItems(items: PublicAnnouncement[]) {
  return items.flatMap((item) => [
    `${item.title}: ${item.body}`,
    "Platform-wide update"
  ]);
}

export function PublicAnnouncementStrip() {
  const { announcements, isLoading, isError, error } = usePublicAnnouncements();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 60_000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (isLoading || isError || !announcements.length) {
    if (isError) {
      return (
        <Card className="mx-auto w-full max-w-6xl border-softCoral/20 bg-white/75">
          <p className="text-sm text-softCoral">{(error as Error).message}</p>
        </Card>
      );
    }

    return null;
  }

  if (!visible) {
    return null;
  }

  const tickerItems = buildTickerItems(announcements);

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
      <div className="relative overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
        <div className="vlaad-announcement-ticker">
          <div className="vlaad-announcement-track">
            {[...tickerItems, ...tickerItems].map((text, index) => (
              <span key={`${text}-${index}`} className="vlaad-announcement-text">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicAnnouncements() {
  const { announcements, isLoading, isError, error } = usePublicAnnouncements();

  if (isLoading || isError || !announcements.length) {
    if (isError) {
      return (
        <Card className="mx-auto w-full max-w-6xl border-softCoral/20 bg-white/75">
          <p className="text-sm text-softCoral">{(error as Error).message}</p>
        </Card>
      );
    }

    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[linear-gradient(180deg,rgba(245,166,35,0.18),rgba(250,250,250,0.92))] p-6 sm:p-8">
            <Badge className="bg-softGold/28 text-deepCrimson">Patch Notes</Badge>
            <h2 className="mt-3 text-3xl font-semibold text-deepCrimson">Recent platform-wide updates.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-deepCrimson/72">
              The latest patch notes stay pinned here so guests can catch up on changes, advisories, and release notes anytime.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:p-8">
            {announcements.slice(0, 4).map((item) => (
              <article key={item.id} className="rounded-[24px] border border-softCoral/14 bg-cleanWhite/88 p-5 shadow-[0_10px_30px_rgba(139,0,0,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="bg-softCoral/12 text-deepCrimson">{item.label}</Badge>
                  <p className="text-xs uppercase tracking-[0.18em] text-deepCrimson/42">{formatAnnouncementDate(item.createdAt)}</p>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-softCoral" />
                  <div>
                    <h3 className="text-lg font-semibold text-deepCrimson">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-deepCrimson/72">{item.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
