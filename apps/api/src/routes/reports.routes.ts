import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { anonymousReportLimiter } from "../middleware/rate-limit";
import { validateBody } from "../middleware/validate";
import { createReport, getReportById, listReports } from "../services/report.service";
import { asyncHandler } from "../utils/async-handler";
import { reportFlagSchema, reportSchema } from "../validators/reports";

export const reportsRouter = Router();

reportsRouter.get("/", asyncHandler(async (_req, res) => {
  const items = await listReports();
  res.json({ items });
}));

reportsRouter.get("/:id", asyncHandler(async (req, res) => {
  const item = await getReportById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Blood report not found" });
  }

  return res.json({ item });
}));

reportsRouter.post("/", anonymousReportLimiter, validateBody(reportSchema), asyncHandler(async (req, res) => {
  const item = await createReport(req.body);
  res.status(201).json({ message: "Report submitted", item });
}));

reportsRouter.patch("/:id", requireAuth, validateBody(reportSchema.partial()), (req, res) => {
  res.json({ message: "Report updated", id: req.params.id, changes: req.body });
});

reportsRouter.post("/:id/flag", requireAuth, validateBody(reportFlagSchema), (req, res) => {
  res.status(201).json({ message: "Report flagged", id: req.params.id, reason: req.body.reason });
});

reportsRouter.post("/:id/images", requireAuth, (_req, res) => {
  res.status(201).json({ message: "Signed upload URL issued" });
});
