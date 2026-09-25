import "server-only";
// Mock EmailSender that records messages in memory instead of sending them. Nothing leaves the process.
import type { EmailMessage, EmailSender, SentEmail } from "./types";

const globalForOutbox = globalThis as typeof globalThis & { __reynavOutbox?: (EmailMessage & SentEmail)[] };
const outbox: (EmailMessage & SentEmail)[] = (globalForOutbox.__reynavOutbox ??= []);

export class MockEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<SentEmail> {
    const sent = { id: `mail_${Date.now().toString(36)}_${outbox.length}`, sentAt: new Date() };
    outbox.push({ ...message, ...sent });
    return sent;
  }
}
