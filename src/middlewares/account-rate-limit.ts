import { Request, Response, NextFunction } from "express";

// A lightweight per-process guard for this college demo. Account code failures
// additionally use a database-backed lock across instances.
export function accountRateLimit(max: number, windowMs = 15 * 60 * 1000) {
  const attempts = new Map<string, { count: number; until: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    for (const [key, value] of attempts)
      if (value.until <= now) attempts.delete(key);
    const key = req.ip || "unknown";
    const entry = attempts.get(key) || { count: 0, until: now + windowMs };
    entry.count += 1;
    attempts.set(key, entry);
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.until - now) / 1000)));
      res
        .status(429)
        .json({
          message: "Too many attempts. Please try again in 15 minutes.",
        });
      return;
    }
    next();
  };
}
