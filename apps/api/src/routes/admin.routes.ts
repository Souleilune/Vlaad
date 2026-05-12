import { Router } from "express";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";
import { validateBody } from "../middleware/validate";
import { listAdminUsers, queueAnnouncement, updateUserRole } from "../services/admin.service";
import { announcementSchema, roleUpdateSchema } from "../validators/admin";

export const adminRouter = Router();

adminRouter.use(requireRole(["admin"]));

adminRouter.get("/users", asyncHandler(async (_req, res) => {
  const items = await listAdminUsers();
  res.json({ items });
}));

adminRouter.patch("/users/:id/role", validateBody(roleUpdateSchema), asyncHandler(async (req, res) => {
  const item = await updateUserRole(String(req.params.id), req.body.role);
  res.json({ message: "User role updated", item });
}));

adminRouter.post("/announcements", validateBody(announcementSchema), asyncHandler(async (req, res) => {
  const item = await queueAnnouncement(req.body.title, req.body.body);
  res.status(201).json({ message: "Announcement broadcast queued", item });
}));
