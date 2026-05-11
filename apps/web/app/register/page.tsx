"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    bloodType: "",
    city: ""
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { message?: string; token?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Registration failed.");
      }

      setMessage(payload.message ?? "Registration successful. You can now use the account credentials.");
      setForm({
        fullName: "",
        email: "",
        password: "",
        bloodType: "",
        city: ""
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(187,247,208,0.55),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(191,219,254,0.42),_transparent_34%),linear-gradient(135deg,_#fffdf7_0%,_#f6fbff_52%,_#fff6ee_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <Card className="flex items-center border-white/50 bg-white/84 p-6 sm:p-8 lg:order-2">
          <div className="w-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge className="bg-mint/30 text-slate-700">Create account</Badge>
                <h1 className="mt-4 text-3xl font-semibold text-slate-900">Register for Vlaad</h1>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Create an account to manage your profile, keep track of your own blood requests, and return to them later without starting over.
                </p>
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
                <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                <Input
                  className="h-12 bg-white"
                  placeholder="Maria Santos"
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <Input
                  className="h-12 bg-white"
                  placeholder="maria@donor.org"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <Input
                  className="h-12 bg-white"
                  placeholder="At least 8 characters"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Blood type</span>
                  <Input
                    className="h-12 bg-white"
                    placeholder="Optional"
                    value={form.bloodType}
                    onChange={(event) => updateField("bloodType", event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">City</span>
                  <Input
                    className="h-12 bg-white"
                    placeholder="Optional"
                    value={form.city}
                    onChange={(event) => updateField("city", event.target.value)}
                  />
                </label>
              </div>
              <Button className="mt-2 h-12 w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create account"}
              </Button>
              {message ? (
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {message}
                </div>
              ) : null}
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">
                Already registered? <Link className="font-medium text-softCoral" href="/login">Sign in here</Link>.
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Public map remains open</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-white/50 bg-gradient-to-br from-mint/85 via-white to-pixelSky/55 px-7 py-8 lg:order-1 lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.9),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.08),_transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <Badge className="bg-white/70 text-slate-700 ring-1 ring-white/60">User Onboarding</Badge>
              <h2 className="mt-5 max-w-md font-display text-5xl leading-[1.02] text-slate-900">
                Keep your request history tied to one account.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-700">
                Registration connects your identity to the requests you submit, so your profile details and request activity stay available whenever you sign back in.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
