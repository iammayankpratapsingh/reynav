// Runs once when a server instance starts, before it takes requests. Background workflows register here so
// nothing in the request path has to import the jobs layer.
export async function register() {
  // Next.js also calls this in the Edge runtime, which can't load the jobs layer (it uses node:crypto).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { registerJobs } = await import("@/backend/jobs");
  registerJobs();
}
