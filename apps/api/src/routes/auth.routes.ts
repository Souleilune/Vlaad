import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { supabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";
import { getUserRole } from "../services/admin.service";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { forgotPasswordSchema, loginSchema, registerSchema } from "../validators/auth";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(async (req, res) => {
  if (!supabaseAdmin) {
    throw new ApiError(503, "Supabase is not configured for registration yet.");
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: req.body.email,
    password: req.body.password,
    email_confirm: true,
    user_metadata: {
      full_name: req.body.fullName,
      blood_type: req.body.bloodType,
      city: req.body.city
    }
  });

  if (error || !data.user) {
    throw new ApiError(400, error?.message ?? "Failed to create user.");
  }

  const { error: profileError } = await supabaseAdmin.from("users").insert({
    id: data.user.id,
    full_name: req.body.fullName,
    blood_type: req.body.bloodType || null,
    city: req.body.city || null
  });

  if (profileError) {
    throw new ApiError(500, "User created but profile setup failed.", profileError.message);
  }

  const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({
    user_id: data.user.id,
    role: "user"
  });

  if (roleError) {
    throw new ApiError(500, "User created but role setup failed.", roleError.message);
  }

  const role = await getUserRole(data.user.id);
  const payload = { sub: data.user.id, email: req.body.email, role };
  const token = jwt.sign(payload, env.SUPABASE_JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ message: "Registration successful.", token, user: payload });
}));

authRouter.post("/login", validateBody(loginSchema), asyncHandler(async (req, res) => {
  if (!supabaseAdmin) {
    throw new ApiError(503, "Supabase is not configured for login yet.");
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email: req.body.email,
    password: req.body.password
  });

  if (error || !data.user) {
    throw new ApiError(401, error?.message ?? "Invalid email or password.");
  }

  const role = await getUserRole(data.user.id);
  const payload = { sub: data.user.id, email: data.user.email ?? req.body.email, role };
  const token = jwt.sign(payload, env.SUPABASE_JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: payload });
}));

authRouter.post("/google", (_req, res) => {
  res.json({ url: "/auth/google/start" });
});

authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), (req, res) => {
  res.json({ message: `Password reset link queued for ${req.body.email}` });
});

authRouter.get("/session", (req, res) => {
  res.json({ session: req.auth ?? null });
});

authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  if (!supabaseAdmin) {
    throw new ApiError(503, "Supabase is not configured for profile loading yet.");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("id, full_name, blood_type, city")
    .eq("id", req.auth!.sub)
    .maybeSingle();

  if (profileError) {
    throw new ApiError(500, "Failed to load user profile.", profileError.message);
  }

  if (!profile) {
    throw new ApiError(404, "Profile not found for the authenticated user.");
  }

  const role = await getUserRole(req.auth!.sub);

  res.json({
    user: {
      id: profile.id,
      email: req.auth!.email ?? null,
      role,
      fullName: profile.full_name,
      bloodType: profile.blood_type,
      city: profile.city
    }
  });
}));
