import { Request, Response } from "express";
import httpStatus from "http-status";
import * as lectureService from "../service/schedule.service";

export async function postLecture(req: Request, res: Response) {
  try {
    const schedule = await lectureService.lecture({
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

export async function getLectures(req: Request, res: Response) {
  try {
    const schedules =
      res.get("role") === "special need student"
        ? await lectureService.lectureByUserId(res.get("userId")!)
        : await lectureService.lectureByAdmin();

    return res.status(httpStatus.OK).send({
      data: schedules,
      statusCode: httpStatus.OK,
      message: "Schedules succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function getLecturesAdmin(req: Request, res: Response) {
  try {
    const schedules = await lectureService.lectureByAdmin();
    return res.status(httpStatus.OK).send({
      data: schedules,
      statusCode: httpStatus.OK,
      message: "Lectures succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}
