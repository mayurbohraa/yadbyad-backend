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
import { Types } from "mongoose";


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
        specialNeedsStudentID:req.body.specialNeedsStudentID,
        notificationType: "examAdded",
      } as Notification);
      return res.status(httpStatus.OK).send({
        data: schedule,
        statusCode: httpStatus.OK,
        message: `${schedule.type} scheduled succesfully`,
      });
    }
    else{
      return res.status(httpStatus.BAD_REQUEST).send({
        statusCode: httpStatus.BAD_REQUEST,
        message: `StudentID does not exist `,
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
    const role = res.get("role");
    let schedules: any = [];

    const matchObject: any = {
      userId: new Types.ObjectId(res.get("userId")),
      dropStatus: "open",
    };

    if (role === "part time student") {
      delete matchObject.userId;
      matchObject["$and"] = [{"dropStatus":"open"},{$or:[{status:{$exists:true,$eq:"accepted"}},{status:{$exists:false}}]}];
    }
    if (role === "admin") {
      delete matchObject.userId;
      delete matchObject.dropStatus;
      delete matchObject.status;
    }
  
    schedules = await scheduleService.getSchedule(matchObject);

    return res.status(httpStatus.OK).send({
      data: schedules,
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
      (schedule: Schedule) =>
        schedule.type === "exam" && schedule.dropStatus === "open"
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
