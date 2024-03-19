import { Request, Response } from "express";
import httpStatus from "http-status";
import * as casualService from "../service/schedule.service";
export async function postCasual(req: Request, res: Response) {
  try {
    const schedule = await casualService.Casual({
      userId: res.get("userId"),
      ...req.body,
    });

    return res.status(httpStatus.OK).send({
      data: schedule,
      statusCode: httpStatus.OK,
      message: "Schedule succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function getRequests(req: Request, res: Response) {
  try {
    const schedules =
      res.get("role") === "special need student"
      // res.get("status") === "casual"
        ? await casualService.CasualByUserId(res.get("userId")!)
        : await casualService.CasualByAdmin();

    return res.status(httpStatus.OK).send({
      data: schedules,
      statusCode: httpStatus.OK,
      message: "Schedules succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function casualAccepted(req: Request, res: Response) {
  try {
    const schedules = await casualService.CasualAccepted();

    return res.status(httpStatus.OK).send({
      data: schedules,
      statusCode: httpStatus.OK,
      message: "Schedules succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function requestUpdate(req: Request, res: Response) {
  try {
    console.log(req.body);
    const request = await casualService.requestUpdate(
      req.params.id,
      req.params.update
    );
    return res.status(httpStatus.OK).send({
      data: request,
      statusCode: httpStatus.OK,
      message: "Request Updated succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}
