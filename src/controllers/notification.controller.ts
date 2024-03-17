import { Request, Response } from "express";
import httpStatus from "http-status";
import { Types } from "mongoose";
import { Notification } from "../models/notification.model";
import { NotificationService} from "../service";
import { compare } from "bcryptjs";

export async function createNotification(req: Request, res: Response) {
  try {
    const userId  =  res.get("userId")!;
    const { message, notificationType , userId1} =  req.body;
      const Notification = {
       
        message:message,
        notificationType: notificationType,
        userId: userId1
      };
     
      const createdNotification = await NotificationService.createNotification( Notification as Notification);
    //   await SettingsService.createSettings(createdComplain._id);
     
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


export async function fetchSpecificNotification(req: Request, res: Response) {
  try {
   
    const {userId}  =  req.params;
    const { page, limit } = req.query;

   
    const notifications = await NotificationService.fetchNotifications(
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    const unreadNotifications = notifications.filter((notifications: Notification) => (notifications.isRead == false));
   
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Notification is fetched successfully",
      data: unreadNotifications
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

export async function fetchNotification(req: Request, res: Response) {
  try {
   
    const { page, limit } = req.query;

   
    const notifications = await NotificationService.fetchAllNotifications(
      parseInt(page as string),
      parseInt(limit as string)
    );

    const unreadNotifications = notifications.filter((notifications: Notification) => (notifications.isRead ==  false && (notifications.notificationType == "reportSlotCreated" || 
    notifications.notificationType == "reportSlotDeleted" || notifications.notificationType == "resourcecreated" || notifications.notificationType == "resourceedited")));
   
  
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Notification is fetched successfully",
      data: unreadNotifications
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

export async function fetchAdminNotification(req: Request, res: Response) {
  try {
   
    const { page, limit } = req.query;

   
    const notifications = await NotificationService.fetchAllNotifications(
      parseInt(page as string),
      parseInt(limit as string)
    );

    const unreadNotifications = notifications.filter((notifications: Notification) => (notifications.isRead ==  false && (notifications.notificationType == "complainsubmitted" || notifications.notificationType == "reportsubmitted")));
   
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Notification is fetched successfully",
      data: unreadNotifications
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
   
    const id  =  res.get("userId")!;
    const { page, limit } = req.query;

   
    const notifications = await NotificationService.fetchNotifications(
      id,
      parseInt(page as string),
      parseInt(limit as string)
    );

    const unreadNotifications = notifications.filter((notifications: Notification) => notifications.isRead == false);
    const readNotifications = unreadNotifications.filter((unreadNotification: Notification) => unreadNotification.isRead =true);
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Notification is fetched successfully",
      data: readNotifications
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
