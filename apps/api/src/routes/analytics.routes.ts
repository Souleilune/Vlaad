import { Router } from "express";
import { requireRole } from "../middleware/require-role";

export const analyticsRouter = Router();

analyticsRouter.use(requireRole(["admin"]));

analyticsRouter.get("/overview", (_req, res) => {
  res.json({
    totalReports: 0,
    activeBloodAvailability: 0,
    activeEmergencies: 0,
    resolvedRequests: 0,
    userGrowth: 0,
    verificationRate: 0
  });
});

analyticsRouter.get("/heatmap", (_req, res) => {
  res.json({ items: [] });
});
