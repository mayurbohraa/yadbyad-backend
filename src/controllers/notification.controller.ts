import { Request, Response } from "express";
import httpStatus from "http-status";
import { Notification } from "../models/notification.model";
import { NotificationService} from "../service";

export async function createNotification(req: Request, res: Response) {
  try {
    
    const { message, notificationType , userId} =  req.body;
      const Notification = {
       
        message:message,
        notificationType: notificationType,
        userId: userId
      };
     
      const createdNotification = await NotificationService.createNotification( Notification as Notification);
      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "Notification is created successfully",
        data: createdNotification
        
      });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}


export async function fetchNotification(req: Request, res: Response) {
  try {
    const userId  =  res.get("userId")!;
    const { page, limit, role } = req.query;

   const matchBody: any = {
    // isRead : false, 
    readBy: { $nin: userId } 
  };

  if(role == "admin"){
    matchBody["$or"] = [
      {notificationType: "complainsubmitted"} ,
      {notificationType:"reportsubmitted"},
      {notificationType:"casualSessionRequested"},
      {notificationType:"Casual/Exam/LectureDeleted"},
    ];
  }
  else if(role == "part time student" ){
   
    matchBody["$or"] = [
      { notificationType: "reportSlotDeleted" },
      { notificationType: "resourcecreated" },
      { notificationType: "resourceedited" },
      { notificationType: "reportSlotCreated" },
      { notificationType: "lectureCreated" },
      { notificationType: "examAdded" },
      {notificationType:"Casual/Exam/LectureDeleted"},
      {
        $and: [
          { notificationType: { $nin: ["reportsubmitted", "complainsubmitted"] } },
          { $or: [{ userId: userId },{ requesteeId :userId} ,{ userId: { $exists: false } }] },
        ],
      },
    ];
    
  }else{
    matchBody["$or"] = [
      { notificationType: "resourcecreated" },
      { notificationType: "resourceedited" },
      { notificationType: "examAdded" },
      { notificationType: "partTimeCasual/Exam/LectureRequest" },
      { notificationType: "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed" },
      {notificationType:"Casual/Exam/LectureDeleted"},
      {
        $and: [
          { notificationType: { $nin: ["reportsubmitted", "complainsubmitted", "reportSlotDeleted","reportSlotCreated"] } },
          { $or: [{ userId: userId }, { userId: { $exists: false } }] },
        ],
      },
    ];
  }

    const notifications = await NotificationService.fetchAllNotifications(
      matchBody,
      parseInt(page as string),
      parseInt(limit as string)
    );

      res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Notification is fetched successfully",
      data: notifications
    });
  }
  catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function readNotification(req: Request, res: Response) {
  try {
    // const {userId}  =  req.params;
    const userId  =  res.get("userId")!;
    const { page, limit, role } = req.query;

   const matchBody: any = {
    // isRead : false,
    readBy: { $nin: userId }
  };

  if(role == "admin"){
    matchBody["$or"] = [
      {notificationType: "complainsubmitted"} ,
      {notificationType:"reportsubmitted"},
      {notificationType:"casualSessionRequested"},
      {notificationType:"Casual/Exam/LectureDeleted"},
    ];
  }
  else if(role == "part time student" ){
   
    matchBody["$or"] = [
      { notificationType: "reportSlotDeleted" },
      { notificationType: "resourcecreated" },
      { notificationType: "resourceedited" },
      { notificationType: "reportSlotCreated" },
      { notificationType: "lectureCreated" },
      { notificationType: "examAdded" },
      {notificationType:"Casual/Exam/LectureDeleted"},
      {
        $and: [
          { notificationType: { $nin: ["reportsubmitted", "complainsubmitted"] } },
          { $or: [{ userId: userId },{ requesteeId :userId} ,{ userId: { $exists: false } }] },
        ],
      },
    ];
    
  }else{
    matchBody["$or"] = [
      { notificationType: "resourcecreated" },
      { notificationType: "resourceedited" },
      { notificationType: "examAdded" },
      { notificationType: "partTimeCasual/Exam/LectureRequest" },
      { notificationType: "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed" },
      {notificationType:"Casual/Exam/LectureDeleted"},
      {
        $and: [
          { notificationType: { $nin: ["reportsubmitted", "complainsubmitted", "reportSlotDeleted","reportSlotCreated"] } },
          { $or: [{ userId: userId }, { userId: { $exists: false } }] },
        ],
      },
    ];
  }

    const notifications = await NotificationService.fetchAllNotifications(
      matchBody,
      parseInt(page as string),
      parseInt(limit as string)
    );


    for (const notification of notifications) {
      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
        await notification.save();
      }
    }


      res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Notification is read successfully",
      data: notifications
    });
  }
  catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}
