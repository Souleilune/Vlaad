"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Map, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { readStoredSession } from "@/lib/auth";

const items = [
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/reports", label: "Reports", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(readStoredSession()?.role === "admin");
  }, []);

  const navItems = isAdmin ? [...items, { href: "/admin", label: "Admin", icon: UserRound }] : items;

  return (
    <aside className="hidden shrink-0 lg:block">
      <div className="group sticky top-6 w-[72px] overflow-hidden rounded-[32px] border border-white/40 bg-white/70 px-2 py-5 shadow-glass backdrop-blur-xl transition-all duration-300 hover:w-72 hover:px-4">
       

        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  "mx-auto flex w-12 items-center justify-center gap-0 rounded-[22px] border border-transparent px-0 py-2 text-sm font-medium text-slate-600 transition hover:border-softCoral/20 hover:bg-softCoral/10 hover:text-slate-900 group-hover:mx-0 group-hover:w-full group-hover:justify-start group-hover:gap-3 group-hover:px-2"
                )}
                title={item.label}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white/88 shadow-[0_8px_18px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-1 group-hover:max-w-[120px] group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
