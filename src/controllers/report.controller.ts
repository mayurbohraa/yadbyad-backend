import { Request, Response } from "express";
import httpStatus from "http-status";
import { Report } from "../models/report.model";
import { ReportService, SettingsService } from "../service";
import userModel from "../models/user.model";
import { Types } from "mongoose";

export async function submitReport(req: Request, res: Response) {
  try {
    // const userId: Types.ObjectId = new Types.ObjectId(res.get("userId"));
    // const user: any = JSON.parse(res.get("user")!);
    const file = req.file;
    console.log(req.file);
    const reports = await ReportService.createReport({
      ...req.body,
      // user: userId,
      fileUrl: file!.path,
      filename: file?.originalname,
    });
    // const admin = await getAdmin();
    // await notificationService.createNotification({
    //   user: admin?._id,
    //   title: `${user.firstName} ${user.lastName} has uploaded the file ${file?.originalname}`,
    //   description: "",
    // });
    res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: "File uploaded successfully",
      data: reports,
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      data: error,
    });
  }
}