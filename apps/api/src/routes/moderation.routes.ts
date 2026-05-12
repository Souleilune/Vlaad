import { Router } from "express";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";
import {
  listModerationQueue,
  rejectModerationReport,
  verifyModerationReport
} from "../services/admin.service";

export const moderationRouter = Router();

moderationRouter.use(requireRole(["admin"]));

moderationRouter.get("/queue", asyncHandler(async (_req, res) => {
  const items = await listModerationQueue();
  res.json({ items });
}));

moderationRouter.post("/reports/:id/verify", asyncHandler(async (req, res) => {
  const item = await verifyModerationReport(String(req.params.id));
  res.json({ message: "Report verified", item });
}));

moderationRouter.post("/reports/:id/reject", asyncHandler(async (req, res) => {
  const item = await rejectModerationReport(String(req.params.id));
  res.json({ message: "Report rejected", item });
}));
