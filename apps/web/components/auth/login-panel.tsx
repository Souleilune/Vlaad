"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDefaultRouteForRole, readStoredSession, saveAuthToken } from "@/lib/auth";

type LoginPanelProps = {
  audience: "user" | "admin";
  badge: string;
  title: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  submitLabel: string;
  successRoute: string;
};

export function LoginPanel({
  audience,
  badge,
  title,
  description,
  heroTitle,
  heroDescription,
  submitLabel,
  successRoute
}: LoginPanelProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    const session = readStoredSession();

    if (session) {
      router.replace(getDefaultRouteForRole(session.role));
    }
  }, [router]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as {
        message?: string;
        token?: string;
        user?: { role?: "user" | "admin" };
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Login failed.");
      }

      if (!payload.token) {
        throw new Error("Login succeeded but no session token was returned.");
      }

      if (audience === "admin" && payload.user?.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }

      saveAuthToken(payload.token);
      setMessage("Login request succeeded. Redirecting...");
      router.push(audience === "admin" ? successRoute : getDefaultRouteForRole(payload.user?.role ?? "user"));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(139,0,0,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(232,82,74,0.18),_transparent_30%),linear-gradient(135deg,_#fafafa_0%,_#fff8f7_46%,_#fdf0ec_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="relative overflow-hidden border-white/50 bg-deepCrimson px-7 py-8 text-white lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(245,166,35,0.2),_transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <Badge className="border border-white/15 bg-white/10 text-white">{badge}</Badge>
              <h1 className="mt-5 max-w-md font-display text-5xl leading-[1.02] text-white">{heroTitle}</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/72">{heroDescription}</p>
            </div>
          </div>
        </Card>

        <Card className="flex items-center border-white/50 bg-white/82 p-6 sm:p-8">
          <div className="w-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge className="bg-pixelSky/35 text-slate-700">{title}</Badge>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900">{submitLabel}</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-softCoral/25 hover:text-slate-900"
              >
                Public home
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <Input
                  className="h-12 bg-white"
                  placeholder={audience === "admin" ? "admin@agos-bd.org" : "donor@hospital.org"}
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <Input
                  className="h-12 bg-white"
                  placeholder="Enter your password"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
              </label>
              <Button className="mt-2 h-12 w-full" disabled={submitting}>
                {submitting ? "Signing in..." : submitLabel}
              </Button>
              {message ? (
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {message}
                </div>
              ) : null}
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">
                {audience === "admin" ? (
                  <>
                    Need the regular member sign-in?{" "}
                    <Link className="font-medium text-softCoral" href="/login">
                      Go to user login
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Need an account first?{" "}
                    <Link className="font-medium text-softCoral" href="/register">
                      Register here
                    </Link>
                    .
                  </>
                )}
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {audience === "admin" ? "Moderation and analytics access" : "Guest map stays available"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
