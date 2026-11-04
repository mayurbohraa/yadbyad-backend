import { mkdir } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import multer from "multer";

export const uploadsDirectory = path.resolve(
  process.env.VERCEL ? tmpdir() : process.cwd(),
  "uploads",
);

const upload = multer({
  storage: multer.diskStorage({
    // Create the directory only when a file arrives. Vercel's bundle is read-only.
    destination: (_req, _file, callback) => {
      mkdir(uploadsDirectory, { recursive: true }, (error) => callback(error, uploadsDirectory));
    },
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname);
      const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      callback(null, file.fieldname + "-" + suffix + extension);
    },
  }),
});

export default upload;
