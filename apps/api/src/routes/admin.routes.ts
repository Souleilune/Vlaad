import { Router } from "express";
import { requireRole } from "../middleware/require-role";
import { validateBody } from "../middleware/validate";
import { announcementSchema, roleUpdateSchema } from "../validators/admin";

export const adminRouter = Router();

adminRouter.use(requireRole(["admin"]));

adminRouter.get("/users", (_req, res) => {
  res.json({ items: [] });
});

adminRouter.patch("/users/:id/role", validateBody(roleUpdateSchema), (req, res) => {
  res.json({ message: "User role updated", id: req.params.id, role: req.body.role });
});

adminRouter.post("/announcements", validateBody(announcementSchema), (req, res) => {
  res.status(201).json({ message: "Announcement broadcast queued", item: req.body });
});
