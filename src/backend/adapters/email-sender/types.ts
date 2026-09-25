import "server-only";
// EmailSender interface and message types.

export type EmailMessage = {
  to: string[];
  subject: string;
  /** Plain-text body. Every email has one, so it reads in any client. */
  text: string;
  html?: string;
};

export type SentEmail = { id: string; sentAt: Date };

export interface EmailSender {
  send(message: EmailMessage): Promise<SentEmail>;
}
