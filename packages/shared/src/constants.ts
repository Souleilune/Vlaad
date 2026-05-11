export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const REPORT_SOURCE_TYPES = [
  "community",
  "trusted_contributor",
  "verified_source"
] as const;

export const REPORT_INTENTS = [
  "request",
  "donor_offer",
  "inventory_offer"
] as const;

export const URGENCY_LEVELS = ["low", "medium", "high", "critical"] as const;

export const REPORT_STATUSES = ["pending", "verified", "rejected", "expired"] as const;

export const USER_ROLES = ["guest", "user", "admin"] as const;
