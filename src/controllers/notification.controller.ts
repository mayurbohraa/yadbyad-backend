import { Request, Response } from "express";
import httpStatus from "http-status";
import { Notification } from "../models/notification.model";
import { NotificationService } from "../service";
import { AuthenticationService } from "../service";

export async function createNotification(req: Request, res: Response) {
  if (req.body.notificationType === "accountRecoveryAccepted") {
    res.status(403).json({
      message: "Recovery acceptance requires administrator approval.",
    });
    return;
  }
  try {
    const { message, notificationType, userId, specialNeedsStudentID } =
      req.body;
    const Notification = {
      message: message,
      notificationType: notificationType,
      userId: userId,
      specialNeedsStudentID: specialNeedsStudentID,
    };

    const createdNotification = await NotificationService.createNotification(
      Notification as Notification,
    );
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Notification is created successfully",
      data: createdNotification,
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
    const userId = res.get("userId")!;
    const { page, limit } = req.query;
    const role = res.locals.user.role;

    const matchBody: any = {
      // isRead : false,
      readBy: { $nin: [userId] },
    };

    if (role == "admin") {
      matchBody["$or"] = [
        { notificationType: "complainsubmitted" },
        { notificationType: "reportsubmitted" },
        { notificationType: "casualSessionRequested" },
        { notificationType: "Casual/Exam/LectureDeleted" },
        { notificationType: "newStudentJoined" },
        {
          $and: [
            {
              notificationType: {
                $nin: [
                  "partTimeCasual/Exam/LectureRequest",
                  "complainReplied",
                  "sessionDropped",
                  "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed",
                  "reportRemarked",
                  "casualSessionAcceptedOrRejected",
                  "examAdded",
                  "lectureCreated",
                  "resourcecreated",
                  "resourceedited",
                  "resourcedeleted",
                  "reportSlotCreated",
                  "reportSlotDeleted",
                ],
              },
            },
          ],
        },
      ];
    } else if (role == "part time student") {
      matchBody["$or"] = [
        { notificationType: "reportSlotDeleted" },
        { notificationType: "reportSlotCreated" },
        { notificationType: "lectureCreated" },
        { notificationType: "examAdded" },
        { notificationType: "Casual/Exam/LectureDeleted" },
        { notificationType: "complainReplied" },
        { notificationType: "reportRemarked" },
        {
          notificationType:
            "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed",
        },
        {
          $and: [
            {
              notificationType: {
                $nin: [
                  "reportsubmitted",
                  "complainsubmitted",
                  "newStudentJoined",
                  "sessionDropped",
                  "partTimeCasual/Exam/LectureRequest",
                ],
              },
            },
            {
              $or: [
                { userId: userId },
                { requesteeId: userId },
                { userId: { $exists: false } },
              ],
            },
          ],
        },
      ];
    } else {
      matchBody["$or"] = [
        { notificationType: "resourcecreated" },
        { notificationType: "resourceedited" },
        { notificationType: "examAdded" },
        { notificationType: "partTimeCasual/Exam/LectureRequest" },
        { notificationType: "Casual/Exam/LectureDeleted" },
        { notificationType: "sessionDropped" },
        { notificationType: "resourcedeleted" },
        { notificationType: "complainReplied" },
        {
          $and: [
            {
              notificationType: {
                $nin: [
                  "reportsubmitted",
                  "complainsubmitted",
                  "reportSlotDeleted",
                  "reportSlotCreated",
                  "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed",
                  "casualSessionRequested",
                  "newStudentJoined",
                ],
              },
            },
            { $or: [{ userId: userId }, { userId: { $exists: false } }] },
          ],
        },
      ];
    }

    matchBody.$and = [
      {
        $or: [
          { notificationType: { $ne: "accountRecoveryAccepted" } },
          { userId },
        ],
      },
    ];
    const notifications = await NotificationService.fetchAllNotifications(
      matchBody,
      Math.max(1, parseInt(page as string, 10) || 1),
      Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50)),
    );

    const user = await AuthenticationService.findUserById(userId);

    if (user) {
      const activeNotifications = notifications.filter(
        (notification: Notification) => {
          if (new Date(notification.createdAt) > user.createdAt) {
            if (notification.notificationType === "examAdded") {
              return (
                notification.specialNeedsStudentID === user.studentID &&
                user.role === "special need student"
              );
            } else if (notification.notificationType === "lectureCreated") {
              return notification.userId !== user._id;
            } else if (notification.notificationType === "sessionDropped") {
              return notification.userId === user._id;
            } else if (
              notification.notificationType ===
              "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed"
            ) {
              return notification.userId === user._id;
            } else {
              return true; // Include notifications with other types
            }
          }
          return false; // Exclude notifications older than user's creation date
        },
      );

      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "Notification is fetched successfully",
        // data: notifications
        data: activeNotifications,
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

export async function readNotification(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { page, limit } = req.query;
    const role = res.locals.user.role;
    console.log(role);

    const matchBody: any = {
      // isRead : false,
      readBy: { $nin: [userId] },
    };

    if (role == "admin") {
      matchBody["$or"] = [
        { notificationType: "complainsubmitted" },
        { notificationType: "reportsubmitted" },
        { notificationType: "casualSessionRequested" },
        { notificationType: "Casual/Exam/LectureDeleted" },
        { notificationType: "newStudentJoined" },
        {
          $and: [
            {
              notificationType: {
                $nin: [
                  "partTimeCasual/Exam/LectureRequest",
                  "complainReplied",
                  "sessionDropped",
                  "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed",
                  "reportRemarked",
                  "casualSessionAcceptedOrRejected",
                ],
              },
            },
          ],
        },
      ];
    } else if (role == "part time student") {
      matchBody["$or"] = [
        { notificationType: "reportSlotDeleted" },
        { notificationType: "reportSlotCreated" },
        { notificationType: "lectureCreated" },
        { notificationType: "examAdded" },
        { notificationType: "Casual/Exam/LectureDeleted" },
        { notificationType: "complainReplied" },
        { notificationType: "reportRemarked" },
        {
          notificationType:
            "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed",
        },
        {
          $and: [
            {
              notificationType: {
                $nin: ["reportsubmitted", "complainsubmitted"],
              },
            },
            {
              $or: [
                { userId: userId },
                { requesteeId: userId },
                { userId: { $exists: false } },
              ],
            },
          ],
        },
      ];
    } else if (role == "special need student") {
      matchBody["$or"] = [
        { notificationType: "resourcecreated" },
        { notificationType: "resourceedited" },
        { notificationType: "examAdded" },
        { notificationType: "partTimeCasual/Exam/LectureRequest" },
        { notificationType: "Casual/Exam/LectureDeleted" },
        { notificationType: "sessionDropped" },
        { notificationType: "resourcedeleted" },
        { notificationType: "complainReplied" },
        {
          $and: [
            {
              notificationType: {
                $nin: [
                  "reportsubmitted",
                  "complainsubmitted",
                  "reportSlotDeleted",
                  "reportSlotCreated",
                  "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed",
                  "casualSessionRequested",
                ],
              },
            },
            { $or: [{ userId: userId }, { userId: { $exists: false } }] },
          ],
        },
      ];
    } else {
      console.log("Enter the role ");
    }

    matchBody.$and = [
      {
        $or: [
          { notificationType: { $ne: "accountRecoveryAccepted" } },
          { userId },
        ],
      },
    ];
    const notifications = await NotificationService.fetchAllNotifications(
      matchBody,
      Math.max(1, parseInt(page as string, 10) || 1),
      Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50)),
    );

    const user = await AuthenticationService.findUserById(userId);

    if (user) {
      const activeNotifications = notifications.filter(
        (notification: Notification) =>
          new Date(notification.createdAt) > user.createdAt,
      );

      for (const notification of activeNotifications) {
        if (!notification.readBy.includes(userId)) {
          notification.readBy.push(userId);
          await notification.save();
        }
      }

      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "All notifications mark read",
        // data: notifications
        data: activeNotifications,
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
