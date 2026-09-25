// Salon pack: service taxonomy.
import type { VerticalService } from "@/shared/types/vertical";

export const services: readonly VerticalService[] = [
  {
    slug: "haircut",
    name: "Haircut",
    aliases: ["womens haircut", "hair cut"],
    priority: 1,
    typicalPrice: 55,
    typicalMinutes: 45,
  },
  { slug: "balayage", name: "Balayage", aliases: ["ombre"], priority: 2, typicalPrice: 220, typicalMinutes: 180 },
  {
    slug: "hair-colour",
    name: "Hair Colour",
    aliases: ["hair color", "root touch up"],
    priority: 3,
    typicalPrice: 120,
    typicalMinutes: 120,
  },
  {
    slug: "bridal-makeup",
    name: "Bridal Makeup",
    aliases: ["wedding makeup"],
    priority: 4,
    typicalPrice: 250,
    typicalMinutes: 90,
  },
  {
    slug: "keratin-treatment",
    name: "Keratin Treatment",
    aliases: ["smoothing treatment", "keratin"],
    priority: 5,
    typicalPrice: 250,
    typicalMinutes: 150,
  },
  {
    slug: "hair-extensions",
    name: "Hair Extensions",
    aliases: ["tape in extensions", "extensions"],
    priority: 6,
    typicalPrice: 400,
    typicalMinutes: 180,
  },
];
