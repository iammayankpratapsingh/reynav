// Salon pack: customer segments.
import type { VerticalSegment } from "@/shared/types/vertical";

export const segments: readonly VerticalSegment[] = [
  { id: "regulars", name: "Regulars", description: "Booked three or more times in the last year" },
  { id: "brides", name: "Brides and bridal parties", description: "Booking around a wedding date" },
  { id: "professionals", name: "Working professionals", description: "Evening and early-morning availability" },
  { id: "students", name: "Students and families", description: "Price-aware, school-term driven" },
  { id: "lapsed", name: "Lapsed clients", description: "No booking in the last six months" },
];
