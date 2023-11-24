import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const Exceptionhandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { name, message } = err;
  // if (config.env === 'production' && !err.isOperational) {
  //   statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  //   message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  // }

  // res.locals.errorMessage = err.message;

  // const response = {
  //   code: statusCode,
  //   message,
  //   ...(config.env === 'development' && { stack: err.stack }),
  // };

  // if (config.env === 'development') {
  //   logger.error(err);
  // }
  res.statusMessage = message;
  res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
    message,
  });
};

export default Exceptionhandler;
