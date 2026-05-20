import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listNotifications, markNotificationRead } from "../services/notification.service";
import { asyncHandler } from "../utils/async-handler";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await listNotifications(String(req.auth?.sub));
    res.json({ items });
  })
);

notificationsRouter.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const item = await markNotificationRead(String(req.auth?.sub), String(req.params.id));
    res.json({ message: "Notification marked as read", item });
  })
);
