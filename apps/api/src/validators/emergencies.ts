import { z } from "zod";
import { BLOOD_TYPES, URGENCY_LEVELS } from "@vlaad/shared";

export const emergencySchema = z.object({
  patientName: z.string().max(140).optional(),
  bloodType: z.enum(BLOOD_TYPES),
  urgencyLevel: z.enum(URGENCY_LEVELS),
  hospitalName: z.string().max(140).optional(),
  notes: z.string().min(8).max(1000),
  address: z.string().min(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  neededBy: z.string().datetime()
});
