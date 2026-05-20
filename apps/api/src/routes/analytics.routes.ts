import { Router } from "express";
import { createTimer, logInfo } from "../lib/logger";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";
import { getAnalyticsHeatmap, getAnalyticsOverview } from "../services/admin.service";

export const analyticsRouter = Router();

analyticsRouter.use(requireRole(["admin"]));

analyticsRouter.get("/overview", asyncHandler(async (_req, res) => {
  const timer = createTimer();
  const item = await getAnalyticsOverview();
  logInfo("Admin endpoint completed.", {
    endpoint: "/api/v1/analytics/overview",
    durationMs: timer.elapsedMs()
  });
  res.json(item);
}));

analyticsRouter.get("/heatmap", asyncHandler(async (_req, res) => {
  const timer = createTimer();
  const item = await getAnalyticsHeatmap();
  logInfo("Admin endpoint completed.", {
    endpoint: "/api/v1/analytics/heatmap",
    durationMs: timer.elapsedMs()
  });
  res.json(item);
}));
