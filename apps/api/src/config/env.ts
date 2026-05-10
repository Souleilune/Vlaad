import { fileURLToPath } from "node:url";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const workspaceEnvPath = path.resolve(currentDir, "../../../../.env");

loadEnv({ path: workspaceEnvPath });
loadEnv();

const envSchema = z.object({
  API_PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().default("dev-secret")
});

export const env = envSchema.parse(process.env);
