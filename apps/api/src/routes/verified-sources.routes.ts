import { randomUUID } from "node:crypto";
import { Router } from "express";
import { requireRole } from "../middleware/require-role";
import { validateBody } from "../middleware/validate";
import { verifiedSourceSchema } from "../validators/admin";

export const verifiedSourcesRouter = Router();

verifiedSourcesRouter.get("/", (_req, res) => {
  res.json({ items: [] });
});

verifiedSourcesRouter.post("/", requireRole(["admin"]), validateBody(verifiedSourceSchema), (req, res) => {
  res.status(201).json({ message: "Verified source created", item: { id: randomUUID(), ...req.body } });
});

verifiedSourcesRouter.patch(
  "/:id",
  requireRole(["admin"]),
  validateBody(verifiedSourceSchema.partial()),
  (req, res) => {
    res.json({ message: "Verified source updated", id: req.params.id, changes: req.body });
  }
);
