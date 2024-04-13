import { Request, Response } from "express";
import httpStatus from "http-status";
import * as lectureService from "../service/schedule.service";
import { Notification } from "../models/notification.model";
import { NotificationService } from "../service";
import { Schedule } from "../models/exam.model";


export async function postLecture(req: Request, res: Response) {
  try {
    const selectedDays: string[] = req.body.selectedDays;
    const selectedDates: string[] = await lectureService.findDatesForSelectedDaysInMonth(selectedDays,req.body.month);

    const lectures: any [] = await Promise.all(selectedDates.map(async (date) => {
      const schedule = await lectureService.createLectures({
        userId: res.get("userId"),
        ...req.body,
        date:date 
      });

      return schedule;
    }));

    NotificationService.createNotification({
      message: "New Lectures Scheduled",
      userId: res.get("userId"),
      notificationType: "lectureCreated",
    } as Notification);

    return res.status(httpStatus.OK).send({
      data: lectures,
      statusCode: httpStatus.OK,
      message: "Schedules successfully created",
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

    const activeSchedules = schedules.filter(
      (schedule: Schedule) => schedule.dropStatus === "open"
    );

    return res.status(httpStatus.OK).send({
      data: activeSchedules,
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

export async function addRequesteeId(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { casualId } = req.params;
    const request = await lectureService.findCasualById(casualId);

    if (request) {
      request.requesteeId = userId;
      request.dropStatus= "deleted";
      request.save();
      NotificationService.createNotification({
        message: `Lecture session's requestee Id is added`,
        userId: request.userId,
        notificationType: "partTimeCasual/Exam/LectureRequest",
      } as Notification);
    }

    return res.status(httpStatus.OK).send({
      data: request,
      statusCode: httpStatus.OK,
      message: "Requestee Id Updated succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function requestUpdateSpecialNeed(req: Request, res: Response) {
  try {
    console.log(req.body);
    const request = await lectureService.requestUpdateSpecialNeed(
      req.params.id,
      req.params.update
    );

    if(request.specialNeedStatus == "rejected"){
      request.dropStatus = "open";
      request.save();
    }

    NotificationService.createNotification({
      message: `Lecture session is ${request.specialNeedstatus} by Special need Student`,
      userId: request.userId,
      notificationType:
        "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed",
    } as Notification);

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
