import { Request, Response } from "express";
import httpStatus from "http-status";
import * as requestService from "../service/slotrequests.service";
import { NotificationService } from "../service";
import { Notification } from "../models/notification.model";
import * as scheduleService from "../service/schedule.service";
import slotModel, { SlotRequest } from "../models/slot-requests.model";
import { schedule } from "node-cron";
import { Schedule } from "../models/schedule.model";

// for part time student to post request
export async function postRequest(req: Request, res: Response) {
  try {
    const schedule = await requestService.Reuest({
      requesteeId: res.get("userId"),
      ...req.body,
    });

    NotificationService.createNotification({ 
      message: `Schedule Match Request Arrived`,
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
    
    const request = await requestService.requestUpdate(
      req.params.id,
      req.body.requesteeId,
      req.body.eventId,
      req.params.update
    );

   const schedule = await scheduleService.findCasualById(req.body.eventId);

   if(schedule){
   schedule.slotRequestId = request._id;
   schedule.save();
   }

    NotificationService.createNotification({ 
      message: `Schedule Match request ${request.status} `,
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

// for part time student to drop the request
export async function dropRequest(req: Request, res: Response) {
  try {
    

    const schedule = await scheduleService.findCasualById(req.body.eventId);

    if(schedule){
    schedule.slotRequestId = null;
    schedule.requesteeId = null;
    schedule.save();
    }
    
    return res.status(httpStatus.OK).send({
      data: schedule,
      statusCode: httpStatus.OK,
      message: "Request Dropped succesfully",
    });
  
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}
