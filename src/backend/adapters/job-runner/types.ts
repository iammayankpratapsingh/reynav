import "server-only";
// JobRunner interface: define workflows, steps, throttles, priorities and send events.

export type JobPriority = "interactive" | "scheduled";

/** Payloads carry ids only. Large data is written to the database and referenced. */
export type JobEvent = {
  name: string;
  priority: JobPriority;
  data: Record<string, string>;
};

export type JobHandler = (data: Record<string, string>) => Promise<void>;

/** A recurring job. `cron` is a standard five-field expression; real runners honour it exactly. */
export type JobSchedule = {
  name: string;
  cron: string;
  handler: () => Promise<void>;
};

export interface JobRunner {
  /** Registering the same name twice replaces the handler, so a hot reload cannot stack them up. */
  register(name: string, handler: JobHandler): void;
  /** Registering the same schedule name twice replaces it. */
  schedule(job: JobSchedule): void;
  /** Returns as soon as the job is accepted. It never waits for the work to finish. */
  send(event: JobEvent): Promise<void>;
}
