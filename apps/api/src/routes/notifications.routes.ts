import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get("/", (req, res) => {
  res.json({ items: [], userId: req.auth?.sub });
});

notificationsRouter.patch("/:id/read", (req, res) => {
  res.json({ message: "Notification marked as read", id: req.params.id });
});
