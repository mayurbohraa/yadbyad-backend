import { Request, Response } from "express";
import httpStatus from "http-status";
import * as scheduleService from "../service/schedule.service";
import { AuthenticationService, NotificationService, ScheduleService } from "../service";
import { Notification } from "../models/notification.model";
import ScheduleModel, { Schedule } from "../models/exam.model";


export async function postSchedule(req: Request, res: Response) {
  try {

    const userID = await AuthenticationService.findUserByStudentId(
      req.body.specialNeedsStudentID
    );

    if (userID) {
      const schedule = await scheduleService.schedule({
        userId: userID._id,
        ...req.body,
      });

      NotificationService.createNotification({ 
        message: "new exam is added ",
        userId: schedule.userId.toString(),
        notificationType: "examAdded",
  
         } as  Notification
       );
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


export async function addRequesteeId(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { examId } = req.params;
    const request = await scheduleService.findCasualById(examId);

    
    if(request){
      request.requesteeId= userId;
      request.save();
    NotificationService.createNotification({ 
      message: `Exam session's requestee Id is added`,
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

export async function requestUpdateSpecialNeed(req: Request, res: Response) {
  try {
    console.log(req.body);
    const request = await ScheduleService.requestUpdateSpecialNeed(
      req.params.id,
      req.params.update
    );

    NotificationService.createNotification({ 
      message: `Exam session is ${request.specialNeedStatus} by Special need Student`,
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

// export async function getRequest(req: Request, res: Response) {
//   try {
//     const requests = await scheduleService.requestByUserId(res.get("userId")!);
//     return res.status(httpStatus.OK).send({
//       data: requests,
//       statusCode: httpStatus.OK,
//       message: "Request fetched succesfully",
//     });
//   } catch (error) {
//     return res.status(500).json(error);
//   }
// }

// export async function getRequestAdmin(req: Request, res: Response) {
//   try {
//     const requests = await scheduleService.requestByAdmin();
//     return res.status(httpStatus.OK).send({
//       data: requests,
//       statusCode: httpStatus.OK,
//       message: "Request fetched succesfully",
//     });
//   } catch (error) {
//     return res.status(500).json(error);
//   }
// }

// export async function schedule(req: Request, res: Response) {
//   // console.log(req);
//   try {
//     const schedule = await scheduleService.schedule({
//       userId: res.get("userId"),
//       ...req.body,
//     });
//     return res.status(httpStatus.OK).send({
//       data: schedule,
//       statusCode: httpStatus.OK,
//       message: "Schedule succesfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: error,
//     });
//   }
// }

// export async function request(req: Request, res: Response) {
//   // console.log(req);
//   try {
//     const request = await scheduleService.request({
//       userId: res.get("userId"),
//       ...req.body,
//     });
//     return res.status(httpStatus.OK).send({
//       data: request,
//       statusCode: httpStatus.OK,
//       message: "Request added succesfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: error,
//     });
//   }
// }

// export async function requestUpdate(req: Request, res: Response) {
//   try {
//     const request = await scheduleService.requestUpdate(
//       req.params.id,
//       req.body
//     );
//     return res.status(httpStatus.OK).send({
//       data: request,
//       statusCode: httpStatus.OK,
//       message: "Request Updated succesfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: error,
//     });
//   }
// }

// export async function matches(req: Request, res: Response) {
//   try {
//     const {type} = req.params;
//     const schedules = await scheduleService.scheduleByUserId(
//       res.get("userId")!
//       );

//     let allMatches: any[] = [];
//     let finalMatches: any[] =[];

//     for (const element of schedules) {
//       if(type == "fetchMatchesSNS"){

//         const matches = await scheduleService.fetchMatchesSNS(
//           element.subject,
//           element.scheduleDate,
//           element.startTime,
//           element.endTime
//           );
//           // console.log(matches);
//           allMatches = allMatches.concat(matches);
//         }

//         if(type == "fetchMatchesPTS"){

//           const matches = await scheduleService.fetchMatchesPTS(
//             element.subject,
//             element.scheduleDate,
//             element.startTime,
//             element.endTime
//             );
//             // console.log(matches);
//             allMatches = allMatches.concat(matches);
//           }
//     }

//     // console.log(allMatches);
//     finalMatches = allMatches.filter(({ _id: value1 }) =>
//       schedules.some(({ id: value2 }) => value1 != value2)
//     );

//     return res.status(httpStatus.OK).send({
//       data: finalMatches,
//       statusCode: httpStatus.OK,
//       message: "Matches fetched succesfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: error,
//     });
//   }
// }
