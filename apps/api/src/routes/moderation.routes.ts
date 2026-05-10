import { Router } from "express";
import { requireRole } from "../middleware/require-role";

export const moderationRouter = Router();

moderationRouter.use(requireRole(["admin"]));

moderationRouter.get("/queue", (_req, res) => {
  res.json({ items: [] });
});

moderationRouter.post("/reports/:id/verify", (req, res) => {
  res.json({ message: "Report verified", id: req.params.id });
});

moderationRouter.post("/reports/:id/reject", (req, res) => {
  res.json({ message: "Report rejected", id: req.params.id });
});
