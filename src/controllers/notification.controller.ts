import { Request, Response } from "express";
import httpStatus from "http-status";
import { Types } from "mongoose";
import { Notification } from "../models/notification.model";
import { NotificationService} from "../service";
import { compare } from "bcryptjs";
import mongoose, { Schema, Document } from "mongoose";

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

// // export async function raedNotification(req: Request, res: Response) {
// //   try {
// //     // const {userId}  =  req.params;
// //     const userId  =  res.get("userId")!;
// //     const { page, limit, role } = req.query;

// //     if (role === "part time student" || role === "special need student") {
// //       await markNotificationsAsRead(userId);
// //     }

// //    const matchBody: any = {
// //     isRead : false,  
// //   };

// //   if(role == "admin"){
// //     matchBody["$or"] = [
// //       {notificationType: "complainsubmitted"} ,
// //       {notificationType:"reportsubmitted"},
// //       {notificationType:"casualSessionRequested"},
// //       {notificationType:"Casual/Exam/LectureDeleted"},
// //     ];
// //   }
// //   else if(role == "part time student" ){
   
// //     matchBody["$or"] = [
// //       { notificationType: "reportSlotDeleted" },
// //       { notificationType: "resourcecreated" },
// //       { notificationType: "resourceedited" },
// //       { notificationType: "reportSlotCreated" },
// //       { notificationType: "lectureCreated" },
// //       { notificationType: "examAdded" },
// //       {notificationType:"Casual/Exam/LectureDeleted"},
// //       {
// //         $and: [
// //           { notificationType: { $nin: ["reportsubmitted", "complainsubmitted"] } },
// //           { $or: [{ userId: userId },{ requesteeId :userId} ,{ userId: { $exists: false } }] },
// //         ],
// //       },
// //     ];
    
// //   }else{
// //     matchBody["$or"] = [
// //       { notificationType: "resourcecreated" },
// //       { notificationType: "resourceedited" },
// //       { notificationType: "examAdded" },
// //       { notificationType: "partTimeCasual/Exam/LectureRequest" },
// //       { notificationType: "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed" },
// //       {notificationType:"Casual/Exam/LectureDeleted"},
// //       {
// //         $and: [
// //           { notificationType: { $nin: ["reportsubmitted", "complainsubmitted", "reportSlotDeleted","reportSlotCreated"] } },
// //           { $or: [{ userId: userId }, { userId: { $exists: false } }] },
// //         ],
// //       },
// //     ];
// //   }

// //     const notifications = await NotificationService.fetchAllNotifications(
// //       matchBody,
// //       parseInt(page as string),
// //       parseInt(limit as string)
// //     );

// //       res.status(httpStatus.OK).send({
// //       statusCode: httpStatus.OK,
// //       message: "Notification is fetched successfully",
// //       data: notifications
// //     });
// //   }
// //   catch (error) {
// //     console.log(error);
// //     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
// //       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
// //       message: error,
// //     });
// //   }
// // }



// export async function readNotification(req: Request, res: Response) {
//   try {
//     const userId = res.get("userId")!;
//     const { page, limit, role } = req.query;

//     // Mark notifications as read for part-time students and special needs students
//     if (role === "part time student" || role === "special need student") {
//       await markNotificationsAsRead(userId);
//     }

//     const matchBody: any = {
//       isRead: false,
//     };

//     if (role === "admin") {
//       matchBody["$or"] = [
//         { notificationType: "complainsubmitted" },
//         { notificationType: "reportsubmitted" },
//         { notificationType: "casualSessionRequested" },
//         { notificationType: "Casual/Exam/LectureDeleted" },
//       ];
//     } else if (role === "part time student") {
//       matchBody["$or"] = [
//         { notificationType: "reportSlotDeleted" },
//         { notificationType: "resourcecreated" },
//         { notificationType: "resourceedited" },
//         { notificationType: "reportSlotCreated" },
//         { notificationType: "lectureCreated" },
//         { notificationType: "examAdded" },
//         { notificationType: "Casual/Exam/LectureDeleted" },
//         {
//           $and: [
//             { notificationType: { $nin: ["reportsubmitted", "complainsubmitted"] } },
//             { $or: [{ userId }, { requesteeId: userId }, { userId: { $exists: false } }] },
//           ],
//         },
//       ];
//     } else {
//       matchBody["$or"] = [
//         { notificationType: "resourcecreated" },
//         { notificationType: "resourceedited" },
//         { notificationType: "examAdded" },
//         { notificationType: "partTimeCasual/Exam/LectureRequest" },
//         { notificationType: "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed" },
//         { notificationType: "Casual/Exam/LectureDeleted" },
//         {
//           $and: [
//             { notificationType: { $nin: ["reportsubmitted", "complainsubmitted", "reportSlotDeleted", "reportSlotCreated"] } },
//             { $or: [{ userId }, { userId: { $exists: false } }] },
//           ],
//         },
//       ];
//     }

//     const notifications = await NotificationService.fetchAllNotifications(
//       matchBody,
//       parseInt(page as string),
//       parseInt(limit as string)
//     );

//     res.status(httpStatus.OK).send({
//       statusCode: httpStatus.OK,
//       message: "Notification is read successfully",
//       data: notifications,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: error,
//     });
//   }
// }

// const userNotificationSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }
// });

// const UserNotification = mongoose.model('UserNotification', userNotificationSchema);


// // Function to mark notifications as read for a user
// async function markNotificationsAsRead(userId: string) {
//   const notifications = await UserNotification.find({ userId });
//   const notificationIds = notifications.map((n) => n.notificationId?.toString());

//   for (const notificationId of notificationIds) {
//     if (notificationId) {
//       await markNotificationAsRead(userId, notificationId);
//     }
//   }
// }

// // Function to mark a single notification as read for a user
// async function markNotificationAsRead(userId: string, notificationId: string) {
//   await UserNotification.updateOne({ userId, notificationId }, { isRead: true });
// }
