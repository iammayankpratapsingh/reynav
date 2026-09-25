import "server-only";
// Scheduled workflow: re-scan every onboarded tenant once a week. The schedule fires often; the service
// decides who is actually due, so a missed or doubled tick is harmless.
import { runWeeklyRescans } from "@/backend/services/scheduling-service";

export const WEEKLY_RESCAN = "scan/weekly-rescan";
/** Mondays at 03:00, spread across the night by the job runner's throttle. */
export const WEEKLY_RESCAN_CRON = "0 3 * * 1";

export async function weeklyRescan(): Promise<void> {
  await runWeeklyRescans(new Date());
}
