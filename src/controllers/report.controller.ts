import { Request, Response } from "express";
import httpStatus from "http-status";
import { Report } from "../models/report.model";
import { ReportService, SettingsService, AuthenticationService } from "../service";
import userModel from "../models/user.model";
import { Types } from "mongoose";

export async function submitReport(req: Request, res: Response) {
  try {
    // const userId: Types.ObjectId = new Types.ObjectId(res.get("userId"));
    // const user: any = JSON.parse(res.get("user")!);

    const { userId } = req.params;
    const file = req.file;
    
    const report = await ReportService.createReport({
      ...req.body,
      // user: userId,
      fileUrl: file!.path,
      filename: file?.originalname,
    });

    const userData = await AuthenticationService.findUserById(
      userId
    );
    // const admin = await getAdmin();
    // await notificationService.createNotification({
    //   user: admin?._id,
    //   title: `${user.firstName} ${user.lastName} has uploaded the file ${file?.originalname}`,
    //   description: "",
    // });
    res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: "File uploaded successfully",
      data: report,
      user: userData,
      token: ReportService.generateToken(report.toObject()),
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      data: error,
    });
  }
}

export async function fetchReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.params;
    const report = await ReportService.findReportById(
      id
    );
    const userData = await AuthenticationService.findUserById(
      userId
    );
    if (userData && report && (userData.status == "active" && report.userStatus == "active")) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Report is fetched successfully",
      data: {
        report,
        user: userData,
      },
    });
  }
  else{
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "user or report is already deleted",
     
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


export async function remarks(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.params;
    const report = await ReportService.findUserByIdAndUpdate(
      id, {...req.body}
    );
    const userData = await AuthenticationService.findUserById(
      userId
    );
    
    if (userData && report && (userData.status == "active" && report.userStatus == "active")) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Report is replied successfully",
      data: {
        report,
        user: userData,
      },
    });
  }
  else{
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "user or report is already deleted",
     
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

export async function deleteReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.params;
    const report = await ReportService.findReportById(
      id
    );
    const userData = await AuthenticationService.findUserById(
      userId
    );

    console.log(report);
   
    if (report) {
      report.userStatus = "deleted";
      report.save();
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Report is deleted successfully",
      data: {
        report,
        user: userData,
      },
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