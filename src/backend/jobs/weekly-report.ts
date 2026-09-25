import "server-only";
// Scheduled workflow: the weekly report email, Monday mornings. The service decides who is due.
import { sendWeeklyReports } from "@/backend/services/report-email-service";

export const WEEKLY_REPORT = "report/weekly-email";
export const WEEKLY_REPORT_CRON = "0 13 * * 1";

export async function weeklyReport(): Promise<void> {
  await sendWeeklyReports(new Date());
}
