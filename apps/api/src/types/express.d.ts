import type { UserRole } from "@vlaad/shared";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        email?: string;
        role: UserRole;
      };
    }
  }
}

export {};
