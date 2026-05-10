import { createApp } from "./app";
import { env } from "./config/env";
import { logInfo } from "./lib/logger";

const app = createApp();

app.listen(env.API_PORT, () => {
  logInfo("Vlaad API listening", { port: env.API_PORT });
});
