// Salon pack: the seven daily tasks of a growth-plan week, pointed at that week's focus service.
import type { VerticalPlanTask } from "@/shared/types/vertical";

export const planTasks: readonly VerticalPlanTask[] = [
  { id: "page", label: "Create or refresh your {service} page with prices, photos and a booking button", effort: "project" },
  { id: "gbp-service", label: "Add {service} to your Google Business Profile services with a price and description", effort: "quick" },
  { id: "post", label: "Publish a Google post showing a recent {service} result", effort: "quick" },
  { id: "reviews", label: "Ask five recent {service} clients for a Google review", effort: "quick" },
  { id: "faqs", label: "Add three FAQs about {service} in {city} to your website", effort: "medium" },
  { id: "social", label: "Share a before-and-after {service} photo on Instagram and link to booking", effort: "quick" },
  { id: "offer", label: "Send past clients a {service} offer for next week's quiet slots", effort: "medium" },
];
