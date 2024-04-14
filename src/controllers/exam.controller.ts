import { Request, Response } from "express";
import httpStatus from "http-status";
import * as scheduleService from "../service/schedule.service";
import {
  AuthenticationService,
  NotificationService,
  ScheduleService,
} from "../service";
import { Notification } from "../models/notification.model";
import { Schedule } from "../models/schedule.model";

export async function postSchedule(req: Request, res: Response) {
  try {
    const userID = await AuthenticationService.findUserByStudentSecondId(
      req.body.specialNeedsStudentID
    );
  

    if (userID) {
      const schedule = await scheduleService.schedule({
        userId: userID._id,
        ...req.body,
      });

      NotificationService.createNotification({
        message: "New Exam Scheduled Check Calendar",
        userId: schedule.userId.toString(),
        notificationType: "examAdded",
      } as Notification);
      return res.status(httpStatus.OK).send({
        data: schedule,
        statusCode: httpStatus.OK,
        message: "Schedule succesfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}


export async function getSchedule(req: Request, res: Response) {
  try {
    const schedules =
      res.get("role") === "special need student"
        ? await scheduleService.scheduleByUserId(res.get("userId")!)
        : await scheduleService.scheduleByAdmin();

   const userId:any = res.get("userId");
    const activeSchedules = schedules.filter((schedule: Schedule) => {
      if (schedule.slotRequestId && schedule.requesteeId) {
        return (
          schedule.dropStatus === "open" &&
          (schedule.requesteeId == userId || schedule.userId == userId)
        );
      } else {
        return schedule.dropStatus === "open";
      }
    });
    

    return res.status(httpStatus.OK).send({
      data: activeSchedules,
      statusCode: httpStatus.OK,
      message: "Schedules succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function getScheduleAdmin(req: Request, res: Response) {
  try {
    const schedules = await scheduleService.scheduleByAdmin();
    return res.status(httpStatus.OK).send({
      data: schedules,
      statusCode: httpStatus.OK,
      message: "Schedules succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function getAdminFetchExam(req: Request, res: Response) {
  try {
    const schedules = await scheduleService.scheduleByAdmin();

    const examSchedules = schedules.filter(
      (schedule: Schedule) => (schedule.type === "exam" && schedule.dropStatus === "open") 
    );

    return res.status(httpStatus.OK).send({
      data: examSchedules,
      statusCode: httpStatus.OK,
      message: "Schedules succesfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function addRequesteeId(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { examId } = req.params;
    const request = await scheduleService.findCasualById(examId);

    if (request) {
      request.requesteeId = userId;
    
      NotificationService.createNotification({
        message: `Schedule Match Request Arrived`,
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
    const request = await ScheduleService.requestUpdateSpecialNeed(
      req.params.id,
      req.params.update
    );

    NotificationService.createNotification({
      message: `Student Schedule Match request  ${request.specialNeedstatus}`,
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



