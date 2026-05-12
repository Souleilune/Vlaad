import { Router } from "express";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";
import { validateBody } from "../middleware/validate";
import { createVerifiedSource, listVerifiedSources, updateVerifiedSource } from "../services/admin.service";
import { verifiedSourceSchema } from "../validators/admin";

export const verifiedSourcesRouter = Router();

verifiedSourcesRouter.get("/", asyncHandler(async (req, res) => {
  const items = await listVerifiedSources(req.auth?.role === "admin");
  res.json({ items });
}));

verifiedSourcesRouter.post(
  "/",
  requireRole(["admin"]),
  validateBody(verifiedSourceSchema),
  asyncHandler(async (req, res) => {
    const item = await createVerifiedSource(req.body);
    res.status(201).json({ message: "Verified source created", item });
  })
);

verifiedSourcesRouter.patch(
  "/:id",
  requireRole(["admin"]),
  validateBody(verifiedSourceSchema.partial()),
  asyncHandler(async (req, res) => {
    const item = await updateVerifiedSource(String(req.params.id), req.body);
    res.json({ message: "Verified source updated", item });
  })
);
