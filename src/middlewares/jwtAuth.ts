import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import jsonwebtoken from "jsonwebtoken";
import JwtVerify from "../interfaces/jwtVerify.interface";

export default async function verify(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    res.status(httpStatus.UNAUTHORIZED).send({
      message: "Unauthorised",
    });
  } else {
    const bearer = authorization.split(" ");
    if (bearer[0] !== "Bearer") {
      res.status(httpStatus.UNAUTHORIZED).send({
        message: "Unauthorised",
      });
    } else {
      const token = bearer[1];
      const user: JwtVerify = jsonwebtoken.verify(
        token,
        process.env.JWT_Token!
      ) as JwtVerify;
      res.set("userId", user._id);
      res.set("firstName", user.firstName);
      res.set("lastName", user.lastName);
      res.set("email", user.email);
      next();
    }
  }
}
