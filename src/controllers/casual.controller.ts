import { Request, Response } from "express";
import httpStatus from "http-status";
import * as casualService from "../service/schedule.service";
import { Schedule } from "../models/schedule.model";
import { Notification } from "../models/notification.model";
import { NotificationService} from "../service";

export async function postCasual(req: Request, res: Response) {
  try {
    const schedule = await casualService.Casual({
      userId: res.get("userId"),
      ...req.body,
    });

    NotificationService.createNotification({ 
      message: "Requested for Casual Session",
      userId: schedule.userId.toString(),
      notificationType: "casualSessionRequested",

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

export async function getRequests(req: Request, res: Response) {
  try {
    const schedules =
      res.get("role") === "special need student"
      // res.get("status") === "casual"
        ? await casualService.CasualByUserId(res.get("userId")!)
        : await casualService.CasualByAdmin();

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

export async function addRequesteeId(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { casualId } = req.params;
    const request = await casualService.findCasualById(casualId);

    
    if(request){
      request.requesteeId= userId;
    NotificationService.createNotification({ 
      message: `Requested for Casual Session`,
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


export async function deleteSchedule(req: Request, res: Response) {
  try {
    const { scheduleId } = req.params;
    const request = await casualService.findCasualById(scheduleId);

    
    if(request){
      request.dropStatus= "deleted";
      request.save();

    NotificationService.createNotification({ 
      message: `${request.type} session's is deleted`,
      userId: request.userId,
      notificationType: "Casual/Exam/LectureDeleted",

       } as  Notification
     );

      

    return res.status(httpStatus.OK).send({
      data: request,
      statusCode: httpStatus.OK,
      message:  `${request.type} session's is deleted successfully`,
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

export async function requestUpdateAdmin(req: Request, res: Response) {
  try {
    console.log(req.body);
    const request = await casualService.requestUpdate(
      req.params.id,
      req.params.update
    );

    NotificationService.createNotification({ 
      message: `Request ${request.status} for casual session `,
      userId: request.userId,
      notificationType: "casualSessionAcceptedOrRejected",

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

export async function requestUpdateSpecialNeed(req: Request, res: Response) {
  try {
    console.log(req.body);
    const request = await casualService.requestUpdateSpecialNeed(
      req.params.id,
      req.params.update
    );

    NotificationService.createNotification({ 
      message: `Request ${request.specialNeedstatus} for casual session `,
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
