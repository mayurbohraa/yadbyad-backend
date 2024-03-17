import { Request, Response } from "express";
import httpStatus from "http-status";
import * as ReportSlotService from "../service/reportSlot.service";
import moment from "moment";
import { Types } from "mongoose";
import axios from "axios";

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

    axios.post(
      "http://localhost:9000/api/v1/notifications/createNotification",
      {
        message: "ReportSlot is Created",
        userId: userId,
        notificationType: "reportSlotCreated",
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
      }
    )
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });

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

    const reportSlots = await ReportSlotService.getReportSlots(
      new Types.ObjectId(userId),
      parseInt(limit as string),
      parseInt(page as string),
      role as string
    );

    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Report slots fetched successfully",
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
    axios.post(
      "http://localhost:9000/api/v1/notifications/createNotification",
      {
        message: "ReportSlot is Deleted",
        userId: reportSlots.userId,
        notificationType: "reportSlotDeleted",
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
      }
    )
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
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
