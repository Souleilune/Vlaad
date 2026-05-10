import type { ReactNode } from "react";
import { AchievementPopup } from "@/components/dashboard/achievement-popup";
import { FloatingActions } from "@/components/layout/floating-actions";
import { AppShell } from "@/components/layout/app-shell";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <AchievementPopup />
      <FloatingActions />
    </>
  );
}
