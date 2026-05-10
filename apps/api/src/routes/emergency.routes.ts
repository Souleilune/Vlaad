import { randomUUID } from "node:crypto";
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { emergencySchema } from "../validators/emergencies";

export const emergencyRouter = Router();

emergencyRouter.get("/", (_req, res) => {
  res.json({ items: [] });
});

emergencyRouter.post("/", validateBody(emergencySchema), (req, res) => {
  res.status(201).json({ message: "Emergency request created", item: { id: randomUUID(), ...req.body } });
});

emergencyRouter.patch("/:id/status", requireAuth, (req, res) => {
  res.json({ message: "Emergency status updated", id: req.params.id, status: req.body.status ?? "resolved" });
});
