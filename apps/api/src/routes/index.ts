import { Router } from "express";
import { adminRouter } from "./admin.routes";
import { analyticsRouter } from "./analytics.routes";
import { announcementsRouter } from "./announcements.routes";
import { authRouter } from "./auth.routes";
import { emergencyRouter } from "./emergency.routes";
import { moderationRouter } from "./moderation.routes";
import { notificationsRouter } from "./notifications.routes";
import { reportsRouter } from "./reports.routes";
import { verifiedSourcesRouter } from "./verified-sources.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true, service: "agos-bd-api" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/announcements", announcementsRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/emergencies", emergencyRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/moderation", moderationRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/verified-sources", verifiedSourcesRouter);
