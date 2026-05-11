"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiUrl } from "@/lib/api";

type ProfileResponse = {
  user: {
    id: string;
    email: string | null;
    role: string;
    fullName: string | null;
    bloodType: string | null;
    city: string | null;
  };
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse["user"] | null>(null);
  const [status, setStatus] = useState<"loading" | "unauthenticated" | "error" | "ready">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("vlaad_token");

    if (!token) {
      setStatus("unauthenticated");
      setMessage("Login is required before your profile can be loaded.");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(apiUrl("/auth/me"), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const payload = (await response.json()) as ProfileResponse & { message?: string };

        if (!response.ok) {
          throw new Error(payload.message ?? "Failed to load profile.");
        }

        setProfile(payload.user);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Failed to load profile.");
      }
    };

    void loadProfile();
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <Badge className="mb-4 bg-mint/35">Trusted Contributor Journey</Badge>
        {status === "loading" ? <h2 className="text-2xl font-semibold text-slate-900">Loading profile...</h2> : null}
        {status === "unauthenticated" ? (
          <>
            <h2 className="text-2xl font-semibold text-slate-900">No active session</h2>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
          </>
        ) : null}
        {status === "error" ? (
          <>
            <h2 className="text-2xl font-semibold text-slate-900">Profile unavailable</h2>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
          </>
        ) : null}
        {status === "ready" && profile ? (
          <>
            <h2 className="text-2xl font-semibold text-slate-900">{profile.fullName ?? "Unnamed user"}</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <p><span className="font-medium text-slate-900">Email:</span> {profile.email ?? "Not available"}</p>
              <p><span className="font-medium text-slate-900">Blood type:</span> {profile.bloodType ?? "Not set"}</p>
              <p><span className="font-medium text-slate-900">City:</span> {profile.city ?? "Not set"}</p>
              {/* <p><span className="font-medium text-slate-900">Role:</span> {profile.role}</p> */}
            </div>
          </>
        ) : null}
      </Card>

      <Card>
        <Badge className="mb-4 bg-retroYellow/40 text-slate-900">Achievement Board</Badge>
        <p className="text-sm text-slate-600">
          Achievement badges, donation streaks, and trusted contributor levels will appear here once you
          connect real user progress data.
        </p>
      </Card>
    </div>
  );
}
