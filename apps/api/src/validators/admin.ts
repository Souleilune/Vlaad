import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(4).max(140),
  body: z.string().min(8).max(1000)
});

export const announcementArchiveSchema = z.object({
  archived: z.boolean()
});

export const roleUpdateSchema = z.object({
  role: z.enum(["user", "admin"])
});

export const verifiedSourceSchema = z.object({
  name: z.string().min(3).max(140),
  sourceType: z.enum(["hospital", "red_cross", "lgu", "donation_center", "volunteer_org"]),
  address: z.string().min(5),
  latitude: z.number(),
  longitude: z.number(),
  contactNumber: z.string().max(30).optional(),
  badgeLabel: z.string().min(2).max(40),
  isActive: z.boolean().default(true)
});
