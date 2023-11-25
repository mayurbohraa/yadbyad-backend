import { Request, Response } from "express";
import httpStatus from "http-status";
import * as scheduleService from "../service/schedule.service";

export async function getSchedule(req: Request, res: Response) {
  try {
    const schedules = await scheduleService.scheduleByUserId(
      res.get("userId")!
    );
    return res.status(httpStatus.OK).send({
      data: schedules,
      statusCode: httpStatus.OK,
      message: "Schedules succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function getRequest(req: Request, res: Response) {
  try {
    const requests = await scheduleService.requestByUserId(res.get("userId")!);
    return res.status(httpStatus.OK).send({
      data: requests,
      statusCode: httpStatus.OK,
      message: "Request fetched succesfully",
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

export async function request(req: Request, res: Response) {
  console.log(req);
  try {
    const request = await scheduleService.request({
      userId: res.get("userId"),
      ...req.body,
    });
    return res.status(httpStatus.OK).send({
      data: request,
      statusCode: httpStatus.OK,
      message: "Request added succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function requestUpdate(req: Request, res: Response) {
  try {
    const request = await scheduleService.requestUpdate(
      req.params.id,
      req.body
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

    return res.status(httpStatus.OK).send({
      data: allMatches,
      statusCode: httpStatus.OK,
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
