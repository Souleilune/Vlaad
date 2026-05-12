import { Router } from "express";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";
import { getAnalyticsHeatmap, getAnalyticsOverview } from "../services/admin.service";

export const analyticsRouter = Router();

analyticsRouter.use(requireRole(["admin"]));

analyticsRouter.get("/overview", asyncHandler(async (_req, res) => {
  const item = await getAnalyticsOverview();
  res.json(item);
}));

analyticsRouter.get("/heatmap", asyncHandler(async (_req, res) => {
  const item = await getAnalyticsHeatmap();
  res.json(item);
}));
