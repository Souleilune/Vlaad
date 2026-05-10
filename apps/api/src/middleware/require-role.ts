import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@vlaad/shared";

export function requireRole(roles: UserRole[]) {
  return function roleMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}
