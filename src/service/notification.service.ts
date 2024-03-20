import { NotificationModel } from "../models";
import { Notification } from "../models/notification.model";
import { ObjectId } from 'mongodb';


/**
 * @description this function creates a notification in database
 * @param {Notification} notification
 * @author Kunal Rathod
 * @returns {Promise<Notification>}
 */

export async function createNotification(notification: Notification): Promise<Notification> {
  return await NotificationModel.create(notification);
}

/**
 * @description This function is used to list all notifications by userId
 * @author Kunal Rathod
 * @param {number} page
 * @param {number} limit
 * @param {String} id
 * @returns {Promise<any>}
 */
export async function fetchNotifications(id: string, page: number, limit: number): Promise<any> {
  const objectId = new ObjectId(id);
  return await NotificationModel.find({userId: objectId})
    .limit(limit)
    .skip((page - 1) * limit).populate({path: "userId",model: "users"});
}

/**
 * @description This function is used to list all notifications
 * @author Kunal Rathod
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<any>}
 */
export async function fetchAllNotifications(matchBody: any, page: number, limit: number): Promise<any> {
  return await NotificationModel.find(matchBody)
    .limit(limit)
    .skip((page - 1) * limit).populate({path: "userId",model: "users"});
}