import { Request, Response } from "express";
import httpStatus from "http-status";
import * as scheduleService from "../service/schedule.service";

export async function getSchedule(req: Request, res: Response) {
  try {
    const schedules = await scheduleService.scheduleByUserId(
      res.get("userId")!
    );
    return res.status(httpStatus.BAD_REQUEST).send({
      data: schedules,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Schedules succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function schedule(req: Request, res: Response) {
  console.log(req);
  try {
    const schedule = await scheduleService.schedule({
      userId: res.get("userId"),
      ...req.body,
    });
    return res.status(httpStatus.BAD_REQUEST).send({
      data: schedule,
      statusCode: httpStatus.BAD_REQUEST,
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

export async function matches(req: Request, res: Response) {
  try {
    const schedules = await scheduleService.scheduleByUserId(
      res.get("userId")!
    );
    const allMatches: any[] = schedules.map(async (sched) => {
      const matches = await scheduleService.fetchMatches(
        sched.subject,
        sched.scheduleDate,
        sched.startTime,
        sched.endTime
      );
      return matches;
    });

    return res.status(httpStatus.BAD_REQUEST).send({
      data: allMatches,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Matches fetched succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}
