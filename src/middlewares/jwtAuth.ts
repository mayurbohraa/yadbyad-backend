import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../models/user.model";

export default async function verify(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const match = req.headers.authorization?.match(/^Bearer (\S+)$/);
  if (!match) {
    res.status(401).json({ message: "Please sign in to continue." });
    return;
  }
  try {
    const payload = jwt.verify(match[1], process.env.JWT_Token!, {
      algorithms: ["HS256"],
      // Login persists until logout/security changes; reset handlers still enforce expiry.
      ignoreExpiration: true,
    }) as JwtPayload;
    if (payload.purpose !== "access") {
      res.status(401).json({ message: "Please sign in again." });
      return;
    }
    const user = await UserModel.findById(payload._id);
    if (
      !user ||
      user.status !== "active" ||
      (user.authVersion || 0) !== payload.authVersion
    ) {
      res
        .status(401)
        .json({ message: "Your session has ended. Please sign in again." });
      return;
    }
    res.locals.user = user;
    // Preserve the contract used by existing scheduling/report controllers.
    res.set("userId", String(user._id));
    res.set("role", user.role);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res
        .status(401)
        .json({ message: "Your session has ended. Please sign in again." });
    } else {
      res
        .status(500)
        .json({ message: "Unable to verify your session. Please try again." });
    }
  }
}
