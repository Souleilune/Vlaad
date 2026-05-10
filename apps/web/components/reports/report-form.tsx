"use client";

import { useState } from "react";
import { ChevronDown, Crosshair, MapPinned } from "lucide-react";
import { BLOOD_TYPES } from "@vlaad/shared";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReportFormProps = {
  onSubmitted?: () => void;
};

const initialForm = {
  title: "",
  bloodType: "O+",
  organizationName: "",
  address: "",
  contactNumber: "",
  description: "",
  latitude: "14.5995",
  longitude: "120.9842",
  expiresAt: "",
  availableBags: "1",
  isEmergency: false,
  nickname: ""
};

type FieldErrors = Partial<Record<keyof typeof initialForm, string>>;

export function ReportForm({ onSubmitted }: ReportFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState(initialForm);

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const nextErrors: FieldErrors = {};

    if (form.title.trim().length < 4) {
      nextErrors.title = "Add a short title with at least 4 characters.";
    }

    if (form.address.trim().length < 5) {
      nextErrors.address = "Add a more complete address or landmark.";
    }

    if (form.description.trim().length < 8) {
      nextErrors.description = "Add a little more detail so responders can understand the incident.";
    }

    if (Number.isNaN(Number(form.latitude)) || Number.isNaN(Number(form.longitude))) {
      nextErrors.latitude = "Latitude and longitude must be valid numbers.";
      nextErrors.longitude = "Latitude and longitude must be valid numbers.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const expiresAt = form.expiresAt
        ? new Date(form.expiresAt).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch(apiUrl("/reports"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          bloodType: form.bloodType,
          organizationName: form.organizationName || undefined,
          description: form.description,
          address: form.address,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          contactNumber: form.contactNumber || undefined,
          expiresAt,
          availableBags: Number(form.availableBags),
          sourceType: "community",
          isEmergency: form.isEmergency,
          nickname: form.nickname || undefined
        })
      });

      const payload = (await response.json()) as {
        message?: string;
        details?: { fieldErrors?: Record<string, string[]> };
      };

      if (!response.ok) {
        const apiFieldErrors = payload.details?.fieldErrors;

        if (apiFieldErrors) {
          setFieldErrors({
            title: apiFieldErrors.title?.[0],
            address: apiFieldErrors.address?.[0],
            description: apiFieldErrors.description?.[0],
            latitude: apiFieldErrors.latitude?.[0],
            longitude: apiFieldErrors.longitude?.[0],
            expiresAt: apiFieldErrors.expiresAt?.[0],
            availableBags: apiFieldErrors.availableBags?.[0]
          });
        }

        throw new Error(payload.message ?? "Failed to submit report.");
      }

      setMessage(payload.message ?? "Report submitted.");
      setForm(initialForm);
      setLocationCaptured(false);
      setFieldErrors({});
      window.dispatchEvent(new CustomEvent("vlaad:reports-refresh"));
      onSubmitted?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not available on this device.");
      return;
    }

    setLocating(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6)
        }));
        setShowMoreFields(true);
        setLocationCaptured(true);
        setFieldErrors((current) => ({ ...current, latitude: undefined, longitude: undefined }));
        setMessage("Location captured. You can submit now or review the coordinates in more details.");
        setLocating(false);
      },
      () => {
        setLocating(false);
        setMessage("We couldn't get your location. You can still enter it manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="rounded-[24px] border border-softCoral/20 bg-softCoral/5 p-4">
        <p className="text-sm font-medium text-slate-900">Quick incident report</p>
        <p className="mt-1 text-sm text-slate-500">
          Start with the essentials. Optional details can be added only if you have them.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <Input
          placeholder="Short title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
        />
        <select
          className="flex h-11 w-full rounded-2xl border border-white/60 bg-white/80 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-softCoral/40"
          value={form.bloodType}
          onChange={(event) => updateField("bloodType", event.target.value)}
        >
          {BLOOD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      {fieldErrors.title ? <p className="text-sm text-softCoral">{fieldErrors.title}</p> : null}

      <Input
        placeholder="Address or landmark"
        value={form.address}
        onChange={(event) => updateField("address", event.target.value)}
      />
      {fieldErrors.address ? <p className="text-sm text-softCoral">{fieldErrors.address}</p> : null}

      <textarea
        className="min-h-28 w-full rounded-[24px] border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-softCoral/40"
        placeholder="What is available or urgently needed? Include anything people should know."
        value={form.description}
        onChange={(event) => updateField("description", event.target.value)}
      />
      {fieldErrors.description ? <p className="text-sm text-softCoral">{fieldErrors.description}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.isEmergency}
            onChange={(event) => updateField("isEmergency", event.target.checked)}
          />
          Mark this as an emergency incident
        </label>
        <Button type="button" variant="secondary" size="sm" onClick={fillMyLocation} disabled={locating}>
          <Crosshair className="mr-2 h-4 w-4" />
          {locating ? "Finding location..." : "Use my location"}
        </Button>
      </div>
      {locationCaptured ? (
        <div className="rounded-2xl bg-mint/20 px-4 py-3 text-sm text-slate-700">
          Location ready: {form.latitude}, {form.longitude}
        </div>
      ) : null}

      <details
        className="rounded-[24px] border border-white/50 bg-white/55 p-4"
        open={showMoreFields}
        onToggle={(event) => setShowMoreFields((event.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-slate-700">
          Add more details
          <ChevronDown className={`h-4 w-4 transition ${showMoreFields ? "rotate-180" : ""}`} />
        </summary>
        <div className="mt-4 space-y-4">
          <Input
            placeholder="Organization or center"
            value={form.organizationName}
            onChange={(event) => updateField("organizationName", event.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Optional contact"
              value={form.contactNumber}
              onChange={(event) => updateField("contactNumber", event.target.value)}
            />
            <Input
              placeholder="Optional nickname"
              value={form.nickname}
              onChange={(event) => updateField("nickname", event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Latitude"
              value={form.latitude}
              onChange={(event) => updateField("latitude", event.target.value)}
            />
            <Input
              placeholder="Longitude"
              value={form.longitude}
              onChange={(event) => updateField("longitude", event.target.value)}
            />
          </div>
          {fieldErrors.latitude || fieldErrors.longitude ? (
            <p className="text-sm text-softCoral">{fieldErrors.latitude ?? fieldErrors.longitude}</p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => updateField("expiresAt", event.target.value)}
            />
            <Input
              type="number"
              min="0"
              placeholder="Available bags"
              value={form.availableBags}
              onChange={(event) => updateField("availableBags", event.target.value)}
            />
          </div>
          {fieldErrors.expiresAt || fieldErrors.availableBags ? (
            <p className="text-sm text-softCoral">{fieldErrors.expiresAt ?? fieldErrors.availableBags}</p>
          ) : null}
          <div className="rounded-2xl bg-slate-50/80 p-3 text-xs text-slate-500">
            <MapPinned className="mr-2 inline h-4 w-4" />
            If you skip expiry, the report will default to 24 hours.
          </div>
        </div>
      </details>

      <Button className="w-full" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit report"}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <p className="text-xs text-slate-500">
        Anonymous reports are allowed, cooldown-protected, and clearly labeled as community reports.
      </p>
    </form>
  );
}
