// The 30-day growth plan: four focus weeks, one task a day, ticked off as the owner goes.

export type PlanTask = {
  id: string;
  week: number;
  day: number;
  /** ISO date, YYYY-MM-DD. */
  dueOn: string;
  serviceName: string;
  label: string;
  effort: "quick" | "medium" | "project";
  done: boolean;
};

export type PlanWeek = {
  week: number;
  serviceSlug: string;
  serviceName: string;
  /** The service opportunity score that earned this week, for "why this service". */
  opportunityScore: number;
  tasks: PlanTask[];
};

export type GrowthPlan = {
  id: string;
  /** "YYYY-MM". */
  period: string;
  startsOn: string;
  weeks: PlanWeek[];
  doneCount: number;
  totalCount: number;
};
