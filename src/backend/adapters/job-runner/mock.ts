import "server-only";
// Mock JobRunner: runs the handler in this process after the response is sent, so a request returns
// immediately while the work carries on. Real runners (Inngest, Step Functions) do the same across machines
// with retries.
import { after } from "next/server";
import type { JobEvent, JobHandler, JobRunner, JobSchedule } from "./types";

/**
 * The mock does not parse cron. It runs every schedule on a short fixed tick and leaves "is anyone due?" to
 * the handler, which is how the scheduled jobs are written anyway.
 */
const MOCK_TICK_MS = 15 * 60 * 1000;

export class MockJobRunner implements JobRunner {
  private handlers = new Map<string, JobHandler>();
  private timers = new Map<string, ReturnType<typeof setInterval>>();

  schedule({ name, handler }: JobSchedule): void {
    clearInterval(this.timers.get(name));
    const run = () =>
      void handler().catch((error: unknown) => {
        console.error(JSON.stringify({ level: "error", message: "scheduled job failed", job: name, error: String(error) }));
      });
    this.timers.set(name, setInterval(run, MOCK_TICK_MS));
  }

  register(name: string, handler: JobHandler): void {
    this.handlers.set(name, handler);
  }

  async send(event: JobEvent): Promise<void> {
    const handler = this.handlers.get(event.name);
    if (!handler) throw new Error(`No handler registered for job ${event.name}`);

    const run = () =>
      handler(event.data).catch((error: unknown) => {
        console.error(JSON.stringify({ level: "error", message: "job failed", job: event.name, error: String(error) }));
      });

    // Inside a request, `after` runs the job once the response is sent and keeps a serverless instance alive
    // until it finishes (up to the route's maxDuration); a bare detached promise is frozen with the response.
    // Outside a request (a scheduled tick) there is nothing to wait for, so it simply runs detached.
    try {
      after(run);
    } catch {
      void run();
    }
  }
}
