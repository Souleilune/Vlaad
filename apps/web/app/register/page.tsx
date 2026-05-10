"use client";

import { useState } from "react";
import Link from "next/link";
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
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <Card className="w-full">
        <Badge className="mb-4 bg-mint/30">Create account</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Register for Vlaad</h1>
        <p className="mt-2 text-sm text-slate-500">
          Use this page to test registered-user onboarding against the live API.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input placeholder="Full name" value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Blood type (optional)"
              value={form.bloodType}
              onChange={(event) => updateField("bloodType", event.target.value)}
            />
            <Input placeholder="City (optional)" value={form.city} onChange={(event) => updateField("city", event.target.value)} />
          </div>
          <Button className="w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </Button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Need the public map instead? <Link className="text-softCoral" href="/map">Open the live map</Link>.
        </p>
      </Card>
    </main>
  );
}
