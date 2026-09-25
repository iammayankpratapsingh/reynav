import "server-only";
// FileStorage interface for uploads (booking CSVs, images).

export type StoredFile = {
  key: string;
  sizeBytes: number;
  contentType: string;
  storedAt: Date;
};

export interface FileStorage {
  put(input: { key: string; body: Uint8Array; contentType: string }): Promise<StoredFile>;
}
