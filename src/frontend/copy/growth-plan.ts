// Product copy for the growth plan screen; vertical words come from the pack's labels.
import type { VerticalLabels } from "@/shared/types/vertical";

export function growthPlanCopy(labels: VerticalLabels) {
  return {
    title: "30-Day Growth Plan",
    subtitle: `One task a day, four weeks, each focused on the service most likely to bring in ${labels.bookingPlural.toLowerCase()}.`,
    /** {done} and {total} are filled in on the client. */
    progress: "{done} of {total} tasks done",
    today: { heading: "Today's task", next: "Next task", allDone: "Every task this month is done. A new plan arrives with next month's first scan." },
    /** {week} and {service} are filled in on the client. */
    weekHeading: "Week {week}: {service}",
    whyWeek: "Opportunity score {score}/100 — demand, competition, conversion, price and your ranking combined.",
    effort: { quick: "Quick", medium: "Medium", project: "Project" },
    markDone: "Mark as done",
    markUndone: "Mark as not done",
    todayBadge: "Today",
    empty: {
      heading: "No plan yet",
      body: "Your plan is written at the end of your first scan each month.",
      cta: { href: "/dashboard", label: "Go to Home" },
    },
    note: "A new plan is written at the start of each month from your latest scan. Ticks are saved as you go.",
  } as const;
}

export type GrowthPlanCopy = ReturnType<typeof growthPlanCopy>;
