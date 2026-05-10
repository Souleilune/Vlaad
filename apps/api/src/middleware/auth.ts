import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.replace("Bearer ", "");

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET) as Request["auth"];
    req.auth = payload;
  } catch {
    req.auth = undefined;
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) {
    return res.status(401).json({ message: "Authentication required" });
  }

  next();
}
