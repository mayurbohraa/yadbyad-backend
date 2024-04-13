import { Request, Response } from "express";
import httpStatus from "http-status";
import * as ReportSlotService from "../service/reportSlot.service";
import { NotificationService} from "../service";
import moment from "moment";
import { Types } from "mongoose";
import { Notification } from "../models/notification.model";
import { ReportSlot } from "../models/reportSlot.model";

export async function createSlot(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { title, startDate, endDate } = req.body;
    const reportSlot = {
      title: title,
      startDate: moment(startDate),
      endDate: moment(endDate),
      userId: userId,
    };

    const createdReportSlot = await ReportSlotService.createSlot(reportSlot);

    NotificationService.createNotification({ 
        message: "ReportSlot is Created",
        userId: userId,
        notificationType: "reportSlotCreated",

       } as  Notification
     );

    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Report slot is created successfully",
      data: createdReportSlot,
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function getReportSlots(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { limit, page, role } = req.query;

    // Get report slots
    let reportSlots = await ReportSlotService.getReportSlots(
      new Types.ObjectId(userId),
      parseInt(limit as string),
      parseInt(page as string),
      role as string
    );

    // Update report slots status to "closed" if end date is less than current date
    const currentDate = new Date();
    reportSlots = reportSlots.map(reportSlot => {
      if (reportSlot.endDate < currentDate) {
        reportSlot.status = "closed";
        reportSlot.save();
      }
      return reportSlot;
    });

    let activeReportSlots = reportSlots.filter(
      (reportSlot: ReportSlot) =>  reportSlot.status = "open"
    );

    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Report slots fetched successfully",
      data: activeReportSlots,
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function deleteReportSlot(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;

    const slotId = req.params.slotId;
    const slot = await ReportSlotService.getReportSlotById(
      new Types.ObjectId(slotId)
    );
    if (slot?.userId.toString() !== userId) {
      return res.status(httpStatus.UNAUTHORIZED).send({
        statusCode: httpStatus.UNAUTHORIZED,
        message: "You are not authorized to delete this slot",
      });
    }

    const reportSlots = await ReportSlotService.deleteReportSlot(
      new Types.ObjectId(slotId)
    );
if(reportSlots){

  NotificationService.createNotification({ 
    message: "ReportSlot is Deleted",
        userId: reportSlots.userId.toString(),
        notificationType: "reportSlotDeleted",

     } as  Notification
   );
    }

    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Report slots deleted successfully",
      data: reportSlots,
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}
