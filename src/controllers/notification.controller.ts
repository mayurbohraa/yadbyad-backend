import { Request, Response } from "express";
import httpStatus from "http-status";
import { Types } from "mongoose";
import { Notification } from "../models/notification.model";
import { NotificationService} from "../service";
import { compare } from "bcryptjs";

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
    // const {userId}  =  req.params;
    const userId  =  res.get("userId")!;
    const { page, limit, role } = req.query;

   const matchBody: any = {
    isRead : false,
    
  };

  if(role == "admin"){
    matchBody["$or"] = [
      {notificationType: "complainsubmitted"} ,
      {notificationType:"reportsubmitted"},
      {notificationType:"casualSessionCreated"},
    ];
  }
  else if(role == "part time student" ){
   
    matchBody["$or"] = [
      { notificationType: "reportSlotDeleted" },
      { notificationType: "resourcecreated" },
      { notificationType: "resourceedited" },
      { notificationType: "reportSlotCreated" },
      {
        $and: [
          { notificationType: { $nin: ["reportsubmitted", "complainsubmitted", "examScheduled"] } },
          { $or: [{ userId: userId }, { userId: { $exists: false } }] },
        ],
      },
    ];
    
  }else{
    matchBody["$or"] = [
      { notificationType: "resourcecreated" },
      { notificationType: "resourceedited" },
      { notificationType: "examScheduled" },
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
    isRead : false,
    
  };

  if(role == "admin"){
    matchBody["$or"] = [
      {notificationType: "complainsubmitted"} ,
      {notificationType:"reportsubmitted"},
      {notificationType:"casualSessionCreated"},
    ];
  }
  else if(role == "part time student" ||role == "special need student" ){
   
    matchBody["$or"] = [
      { notificationType: "reportSlotDeleted" },
      { notificationType: "resourcecreated" },
      { notificationType: "resourceedited" },
      { notificationType: "reportSlotCreated" },
      { notificationType: "examScheduled" },
      {
        $and: [
          { notificationType: { $nin: ["reportsubmitted", "complainsubmitted", "casualSessionCreated"] } },
          { $or: [{ userId: userId }, { userId: { $exists: false } }] },
        ],
      },
    ];
    
  }else{
    console.log("invalid user");
  }

    const notifications = await NotificationService.fetchAllNotifications(
      matchBody,
      parseInt(page as string),
      parseInt(limit as string)
    );

    if(role == "admin"){
    notifications.forEach(async (notification: Notification) => {
      notification.isRead = true; 
      await notification.save(); 
    });
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Notification is read successfully",
      data: notifications
    });
  }
  else{
       notifications.forEach(async (notification: Notification) => {
    // console.log(notification.userId);
      if(notification.userId == userId){
      notification.isRead = true; 
      await notification.save(); 
      }
    });  
    res.status(httpStatus.OK).send({
          statusCode: httpStatus.OK,
          message: "Notification is read successfully",
          data: notifications
        });
  }

     
    
  }
  catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}
// export async function readNotification(req: Request, res: Response) {
//   try {
   
//     const id  =  res.get("userId")!;
//     const { page, limit } = req.query;

   
//     const notifications = await NotificationService.fetchNotifications(
//       id,
//       parseInt(page as string),
//       parseInt(limit as string)
//     );

//     const unreadNotifications = notifications.filter((notifications: Notification) => notifications.isRead == false);
//     const readNotifications = unreadNotifications.filter((unreadNotification: Notification) => unreadNotification.isRead =true);
//     res.status(httpStatus.OK).send({
//       statusCode: httpStatus.OK,
//       message: "Notification is fetched successfully",
//       data: readNotifications
//     });
//   }
//   catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: error,
//     });
//   }
// }
