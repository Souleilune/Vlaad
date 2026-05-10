import { z } from "zod";
import { BLOOD_TYPES } from "@vlaad/shared";

export const reportSchema = z.object({
  title: z.string().min(4).max(140),
  bloodType: z.enum(BLOOD_TYPES),
  organizationName: z.string().max(140).optional(),
  description: z.string().min(8).max(1000),
  address: z.string().min(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  contactNumber: z.string().max(30).optional(),
  expiresAt: z.string().datetime(),
  availableBags: z.number().int().min(0).max(500),
  sourceType: z.enum(["community", "trusted_contributor", "verified_source"]),
  isEmergency: z.boolean().default(false),
  nickname: z.string().max(60).optional()
});

export const reportFlagSchema = z.object({
  reason: z.string().min(4).max(280)
});
