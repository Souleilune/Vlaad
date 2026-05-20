"use client";

import { useEffect, useRef, useState } from "react";
import type { NotificationItem } from "@vlaad/shared";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/hooks/use-notifications";

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function categoryLabel(category: NotificationItem["category"]) {
  switch (category) {
    case "emergency_broadcast":
      return "Announcement";
    case "nearby_alert":
      return "Nearby alert";
    case "reminder":
      return "Reminder";
    default:
      return "System";
  }
}

export function Topbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/patch-notes");
  const isPatchNotes = pathname.startsWith("/patch-notes");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { notifications, isLoading, isError, error, markRead, isMarkingRead } = useNotifications();
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Badge className={`mb-3 ${isAdmin ? "bg-softCoral/15 text-slate-800" : "bg-mint/30 text-slate-700"}`}>
          {isPatchNotes ? "Patch Notes" : isAdmin ? "Admin Control Room" : "Realtime Blood Feed"}
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-900">
          {isPatchNotes
            ? "Archive, restore, and remove platform announcements from the public surface."
            : isAdmin
            ? "Moderate reports, manage operators, and monitor emergency analytics."
            : "Track urgent needs and available blood in one live map."}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative min-w-72">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input className="pl-10" placeholder="Search blood type, city, or request..." />
        </div>
        <div className="relative" ref={containerRef}>
          <Button variant="secondary" size="icon" aria-label="Notifications" onClick={() => setOpen((current) => !current)}>
            <Bell className="h-4 w-4" />
            {unreadCount ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-softCoral px-1 text-[11px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Button>

          {open ? (
            <div className="absolute right-0 top-14 z-30 w-[min(24rem,calc(100vw-2rem))] rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p>
                </div>
                <Badge className="bg-pixelSky/35 text-slate-700">{notifications.length}</Badge>
              </div>

              <div className="mt-4 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                {isLoading ? <p className="text-sm text-slate-500">Loading notifications...</p> : null}
                {isError ? <p className="text-sm text-softCoral">{(error as Error).message}</p> : null}
                {!isLoading && !isError && !notifications.length ? (
                  <p className="rounded-[22px] border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                    Notifications and platform announcements will appear here.
                  </p>
                ) : null}

                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-[22px] border px-4 py-3 transition ${
                      item.readAt ? "border-slate-200 bg-slate-50/80" : "border-softCoral/25 bg-softCoral/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge className={item.category === "emergency_broadcast" ? "bg-retroYellow/45 text-slate-800" : "bg-mint/35 text-slate-700"}>
                          {categoryLabel(item.category)}
                        </Badge>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{formatRelativeTime(item.createdAt)}</p>
                      </div>

                      {!item.readAt ? (
                        <Button size="sm" variant="secondary" onClick={() => markRead(item.id)} disabled={isMarkingRead}>
                          Mark read
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
