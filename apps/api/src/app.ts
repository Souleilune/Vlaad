import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { optionalAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { publicLimiter } from "./middleware/rate-limit";
import { sanitizeBody } from "./middleware/sanitize";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true
    })
  );
  app.use(morgan("dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(publicLimiter);
  app.use(optionalAuth);
  app.use(sanitizeBody);

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
