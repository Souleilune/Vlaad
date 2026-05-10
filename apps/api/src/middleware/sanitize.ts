import type { NextFunction, Request, Response } from "express";

function clean(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/[<>]/g, "").trim();
  }

  if (Array.isArray(value)) {
    return value.map(clean);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, clean(inner)]));
  }

  return value;
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  req.body = clean(req.body);
  next();
}
