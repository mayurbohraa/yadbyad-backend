import { Request, Response } from "express";
import httpStatus from "http-status";
import * as lectureService from "../service/schedule.service";
import { Notification } from "../models/notification.model";
import { LectureService, NotificationService, ScheduleService} from "../service";

export async function postLecture(req: Request, res: Response) {
  try {

    
    const schedule = await lectureService.lecture({
      userId: res.get("userId"),
      ...req.body,
    });

    NotificationService.createNotification({ 
      message: "New Lecture is created",
      userId: schedule.userId.toString(),
      notificationType: "lectureCreated",

       } as  Notification
     );

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

export async function addRequesteeId(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { casualId } = req.params;
    const request = await lectureService.findCasualById(casualId);

    
    if(request){
      request.requesteeId= userId;
      request.save();
    NotificationService.createNotification({ 
      message: `Lecture session's requestee Id is added`,
      userId: request.userId,
      notificationType: "partTimeCasual/Exam/LectureRequest",

       } as  Notification
     );

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

export async function deleteLecture(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { lectureId } = req.params;
    const request = await ScheduleService.findCasualById(lectureId);

    
    if(request){
      request.dropStatus= "deleted";
      request.save();

    NotificationService.createNotification({ 
      message: `Lecture session's is deleted`,
      userId: request.userId,
      notificationType: "Casual/Exam/LectureDeleted",

       } as  Notification
     );

      }

    return res.status(httpStatus.OK).send({
      data: request,
      statusCode: httpStatus.OK,
      message: "lecture session is deleted succesfully",
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

    NotificationService.createNotification({ 
      message: `Lecture session is ${request.specialNeedstatus} by Special need Student`,
      userId: request.userId,
      notificationType: "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed",

       } as  Notification
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
