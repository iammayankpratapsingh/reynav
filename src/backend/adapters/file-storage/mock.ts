import "server-only";
// In-memory mock FileStorage. Per-process: files are gone when the server restarts, like the mock database.
import type { FileStorage, StoredFile } from "./types";

const files = new Map<string, Uint8Array>();

export class MockFileStorage implements FileStorage {
  async put({ key, body, contentType }: { key: string; body: Uint8Array; contentType: string }): Promise<StoredFile> {
    files.set(key, body);
    return { key, sizeBytes: body.byteLength, contentType, storedAt: new Date() };
  }
}
