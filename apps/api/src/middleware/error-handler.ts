import type { NextFunction, Request, Response } from "express";
import { logError } from "../lib/logger";
import { ApiError } from "../utils/api-error";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ApiError) {
    logError(error.message, { statusCode: error.statusCode, details: error.details });
    return res.status(error.statusCode).json({ message: error.message, details: error.details });
  }

  logError("Unhandled API error", { error });
  return res.status(500).json({ message: "Internal server error" });
}
