// Salon pack: id, display name and labels (e.g. staff -> "Stylist").
import type { VerticalManifest } from "@/shared/types/vertical";

export const manifest: VerticalManifest = {
  id: "salon",
  displayName: "Salon",
  labels: {
    business: "Salon",
    businessPlural: "Salons",
    staffMember: "Stylist",
    customerPlural: "Clients",
    bookingPlural: "Appointments",
  },
  businessTypes: [
    { id: "salon", name: "Salon", keywords: ["salon", "hair", "stylist", "beauty"] },
    { id: "spa", name: "Spa", keywords: ["spa", "massage", "wellness"] },
    { id: "barbershop", name: "Barbershop", keywords: ["barber", "barbershop", "fade"] },
    { id: "clinic", name: "Clinic", keywords: ["clinic", "medspa", "med spa", "aesthetic", "laser"] },
  ],
};
