import { Router } from "express";
import { listPublicAnnouncements } from "../services/announcement.service";
import { asyncHandler } from "../utils/async-handler";

export const announcementsRouter = Router();

announcementsRouter.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const items = await listPublicAnnouncements();
    res.json({ items });
  })
);
