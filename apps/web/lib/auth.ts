"use client";

import type { UserRole } from "@vlaad/shared";

export const AUTH_TOKEN_KEY = "vlaad_token";

export type AuthSession = {
  sub: string;
  email?: string;
  role: UserRole;
  exp?: number;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return window.atob(padded);
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function saveAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function readStoredSession(): AuthSession | null {
  const token = getStoredToken();

  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");

    if (!payload) {
      clearAuthToken();
      return null;
    }

    const parsed = JSON.parse(decodeBase64Url(payload)) as AuthSession;

    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      clearAuthToken();
      return null;
    }

    return parsed;
  } catch {
    clearAuthToken();
    return null;
  }
}

export function getDefaultRouteForRole(role: UserRole) {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "user") {
    return "/map";
  }

  return "/";
}
