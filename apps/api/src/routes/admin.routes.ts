import { Router } from "express";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";
import { validateBody } from "../middleware/validate";
import { listAdminAnnouncements, removeAnnouncement, setAnnouncementArchived } from "../services/admin-announcement.service";
import { listAdminUsers, queueAnnouncement, updateUserRole } from "../services/admin.service";
import { announcementArchiveSchema, announcementSchema, roleUpdateSchema } from "../validators/admin";

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

adminRouter.get("/announcements", asyncHandler(async (_req, res) => {
  const items = await listAdminAnnouncements();
  res.json({ items });
}));

adminRouter.patch("/announcements/:id/archive", validateBody(announcementArchiveSchema), asyncHandler(async (req, res) => {
  const item = await setAnnouncementArchived(String(req.params.id), req.body.archived);
  res.json({ message: req.body.archived ? "Announcement archived" : "Announcement restored", item });
}));

adminRouter.delete("/announcements/:id", asyncHandler(async (req, res) => {
  const item = await removeAnnouncement(String(req.params.id));
  res.json({ message: "Announcement removed", item });
}));
