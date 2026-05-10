"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

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

      const payload = (await response.json()) as { message?: string; token?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Login failed.");
      }

      if (payload.token) {
        window.localStorage.setItem("vlaad_token", payload.token);
      }

      setMessage(payload.token ? "Login request succeeded. Redirecting..." : payload.message ?? "Login request succeeded.");
      router.push("/map");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <Card className="w-full">
        <Badge className="mb-4 bg-pixelSky/35">Sign in</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Login to Vlaad</h1>
        <p className="mt-2 text-sm text-slate-500">Use this page to test the live login endpoint.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
          <Button className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </Button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Need an account first? <Link className="text-softCoral" href="/register">Register here</Link>.
        </p>
      </Card>
    </main>
  );
}
