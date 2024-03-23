import { Request, Response } from "express";
import httpStatus from "http-status";
import * as requestService from "../service/slotrequests.service";
import { NotificationService } from "../service";
import { Notification } from "../models/notification.model";
import ScheduleModel, { Schedule } from "../models/exam.model";

// for part time student to post request
export async function postRequest(req: Request, res: Response) {
  try {
    const schedule = await requestService.Reuest({
      requesteeId: res.get("userId"),
      ...req.body,
    });

    NotificationService.createNotification({ 
      message: `${schedule.type} session's requested by part time user`,
      userId: schedule.userId,
      notificationType: "partTimeCasual/Exam/LectureRequest",

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

// for student to get all request for there tasks
export async function getRequests(req: Request, res: Response) {
  try {
    const requests =
      res.get("role") === "part time student"
        ? await requestService.ReuestByPtUserId(res.get("userId")!)
        : await requestService.ReuestByUserId(res.get("userId")!);

    return res.status(httpStatus.OK).send({
      data: requests,
      statusCode: httpStatus.OK,
      message: "Requests succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

// for getting matches of events where student accepted part time's request
export async function requestAccepted(req: Request, res: Response) {
  try {
    const schedules =
      res.get("role") === "part time student"
        ? await requestService.ReuestAcceptedPt(res.get("userId")!)
        : await requestService.ReuestAcceptedSn(res.get("userId")!);
    return res.status(httpStatus.OK).send({
      data: schedules,
      statusCode: httpStatus.OK,
      message: "Schedules succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

// for accepting or rejecting request of part time student
export async function requestUpdate(req: Request, res: Response) {
  try {
    console.log(req.body);
    const request = await requestService.requestUpdate(
      req.params.id,
      req.body.requesteeId,
      req.body.eventId,
      req.params.update
    );

    NotificationService.createNotification({ 
      message: `${request.type} session is ${request.specialNeedStatus} by Special need Student`,
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
