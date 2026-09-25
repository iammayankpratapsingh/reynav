import "server-only";
// Registers every workflow with the job runner. Called once at server start from src/instrumentation.ts.
import { getJobRunner } from "@/backend/adapters/job-runner";
import { SCAN_REQUESTED, type ScanRequestedPayload } from "./events";
import { runScan } from "./scan-workflow";
import { WEEKLY_REPORT, WEEKLY_REPORT_CRON, weeklyReport } from "./weekly-report";
import { WEEKLY_RESCAN, WEEKLY_RESCAN_CRON, weeklyRescan } from "./weekly-rescan";

export function registerJobs(): void {
  const runner = getJobRunner();
  runner.register(SCAN_REQUESTED, async (data) => {
    await runScan(data as unknown as ScanRequestedPayload);
  });
  runner.schedule({ name: WEEKLY_RESCAN, cron: WEEKLY_RESCAN_CRON, handler: weeklyRescan });
  runner.schedule({ name: WEEKLY_REPORT, cron: WEEKLY_REPORT_CRON, handler: weeklyReport });
}
