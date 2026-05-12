"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { UserRole } from "@vlaad/shared";
import { useRouter } from "next/navigation";
import { readStoredSession } from "@/lib/auth";

type AuthGuardProps = {
  children: ReactNode;
  loginRoute: string;
  requiredRole?: Exclude<UserRole, "guest">;
  forbiddenRoute?: string;
};

export function AuthGuard({ children, loginRoute, requiredRole, forbiddenRoute = "/map" }: AuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = readStoredSession();

    if (!session) {
      router.replace(loginRoute);
      return;
    }

    if (requiredRole && session.role !== requiredRole) {
      router.replace(forbiddenRoute);
      return;
    }

    setAllowed(true);
  }, [forbiddenRoute, loginRoute, requiredRole, router]);

  if (!allowed) {
    return (
      <div className="rounded-[28px] border border-white/40 bg-white/70 px-6 py-10 text-sm text-slate-500 shadow-glass backdrop-blur-xl">
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}
