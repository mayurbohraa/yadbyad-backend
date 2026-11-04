import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const Exceptionhandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { message } = err;
  res.statusMessage = message;
  res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
    message,
  });
};

export default Exceptionhandler;
