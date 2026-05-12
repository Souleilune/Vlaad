"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearAuthToken, readStoredSession } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    const session = readStoredSession();
    clearAuthToken();
    router.push(session?.role === "admin" ? "/admin/login" : "/");
    router.refresh();
  };

  return (
    <Button variant="secondary" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
