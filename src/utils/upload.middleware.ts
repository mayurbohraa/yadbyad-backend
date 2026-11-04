import { RequestHandler } from "express";
import multer from "multer";
import path from "node:path";

export const legacyUploadsDirectory = path.resolve(process.cwd(), "uploads");
const receiveFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1, fields: 2 },
}).single("file");

const upload: RequestHandler = (req, res, next) => {
  receiveFile(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      res.status(tooLarge ? 413 : 400).json({
        message: tooLarge ? "Report files must be 4 MB or smaller." : "Invalid report upload.",
      });
    } else {
      next(error);
    }
  });
};

export default upload;
