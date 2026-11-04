import mongoose from "mongoose";
import { finished } from "node:stream/promises";

export function reportFiles() {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Report storage is unavailable.");
  return new mongoose.mongo.GridFSBucket(db, { bucketName: "reportFiles" });
}

export async function storeReportFile(filename: string, buffer: Buffer) {
  const upload = reportFiles().openUploadStream(filename);
  const completion = finished(upload);
  upload.end(buffer);
  await completion;
  return upload.id;
}
