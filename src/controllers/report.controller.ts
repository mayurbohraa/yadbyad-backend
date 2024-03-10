import { Request, Response } from "express";
import httpStatus from "http-status";
import { Report } from "../models/report.model";
import { ReportService, SettingsService, AuthenticationService } from "../service";
import userModel from "../models/user.model";
import { Types } from "mongoose";

export async function submitReport(req: Request, res: Response) {
  try {
    const userId  =  res.get("userId")!;
    const file = req.file;
    
    const report = await ReportService.createReport({
      ...req.body,
      userId: userId,
      fileUrl: file!.path,
      filename: file?.originalname,
    });

    res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: "File uploaded successfully",
      data: report,
    
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      data: error,
    });
  }
}

// export async function fetchReport(req: Request, res: Response) {
//   try {
//     const { id } = req.params;
//     // const userId  =  res.get("userId")!;
//     const report = await ReportService.findReportById(
//       id
//     );
  
//     if (report && report.userStatus == "active") {
//     res.status(httpStatus.OK).send({
//       statusCode: httpStatus.OK,
//       message: "Report is fetched successfully",
//       data: report
      
//     });
//   }
//   else{
//     res.status(httpStatus.OK).send({
//       statusCode: httpStatus.OK,
//       message: "user or report is already deleted",
     
//     });
//   }
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: error,
//     });
//   }
// }

export async function fetchReport(req: Request, res: Response) {
  try {
   
    const id  =  res.get("userId")!;
    const { page, limit } = req.query;
    const reports = await ReportService.fetchReports(
      id,
      parseInt(page as string),
      parseInt(limit as string)
    );

    const activeReports = reports.filter((report: Report) => report.userStatus === "active");
   
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Reports is fetched successfully",
      data: activeReports
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

export async function remarks(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const report = await ReportService.findUserByIdAndUpdate(
      id, {...req.body}
    );
    
    if (report && report.userStatus == "active") {
      // report.status = "Accepted";
     report.save();
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Report is replied successfully",
      data: report,
      
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
    const report = await ReportService.findReportById(
      id
    );
   
    if (report) {
      report.userStatus = "deleted";
      report.save();
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Report is deleted successfully",
      data: report,
      
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