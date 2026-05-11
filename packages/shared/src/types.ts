import type {
  BLOOD_TYPES,
  REPORT_INTENTS,
  REPORT_SOURCE_TYPES,
  REPORT_STATUSES,
  URGENCY_LEVELS,
  USER_ROLES
} from "./constants";

export type BloodType = (typeof BLOOD_TYPES)[number];
export type ReportIntent = (typeof REPORT_INTENTS)[number];
export type ReportSourceType = (typeof REPORT_SOURCE_TYPES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];
export type UserRole = (typeof USER_ROLES)[number];

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BloodReport {
  id: string;
  title: string;
  bloodType: BloodType;
  organizationName?: string | null;
  description: string;
  address: string;
  location: GeoPoint;
  contactNumber?: string | null;
  nickname?: string | null;
  imageUrls: string[];
  expiresAt: string;
  availableBags: number;
  verificationStatus: ReportStatus;
  sourceType: ReportSourceType;
  intent: ReportIntent;
  isEmergency: boolean;
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  patientName?: string | null;
  bloodType: BloodType;
  urgencyLevel: UrgencyLevel;
  hospitalName?: string | null;
  notes: string;
  address: string;
  location: GeoPoint;
  neededBy: string;
  status: "open" | "matched" | "resolved" | "cancelled";
  createdAt: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
  category: "nearby_alert" | "emergency_broadcast" | "reminder" | "system";
}

export interface DonationStat {
  lastDonationDate?: string | null;
  nextEligibleDate?: string | null;
  streak: number;
  totalDonations: number;
  livesSavedEstimate: number;
  reputationScore: number;
  level: string;
}

export interface VerifiedSource {
  id: string;
  name: string;
  sourceType: "hospital" | "red_cross" | "lgu" | "donation_center" | "volunteer_org";
  address: string;
  location: GeoPoint;
  contactNumber?: string | null;
  isActive: boolean;
  badgeLabel: string;
}
