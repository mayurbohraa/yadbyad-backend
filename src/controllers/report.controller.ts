import { Request, Response } from "express";
import httpStatus from "http-status";
import { ReportService, NotificationService } from "../service";
import moment from "moment";
import { Types } from "mongoose";
import { pipeline } from "node:stream/promises";
import { ReportModel } from "../models";
import { Role } from "../models/user.model";
import { reportFiles, storeReportFile } from "../service/report-file.service";
import { legacyUploadsDirectory } from "../utils/upload.middleware";
import { Notification } from "../models/notification.model";

export async function submitReport(req: Request, res: Response) {
  try {
    const { slotId } = req.params;
    const userId = res.get("userId")!;
    const file = req.file;
    if (
      !file ||
      typeof req.body.filename !== "string" ||
      !req.body.filename.trim() ||
      typeof req.body.fileDescription !== "string" ||
      !req.body.fileDescription.trim()
    ) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Provide a report name, description, and file." });
    }

    const reportSlot = await ReportService.findReportSlotById(slotId);

    if (!reportSlot) {
      return res.status(httpStatus.NOT_FOUND).send({
        status: httpStatus.NOT_FOUND,
        message: "Report slot not found",
      });
    }

    const startdate = moment(reportSlot.startDate, "DD-MM-YY: hh:mma");
    const enddate = moment(reportSlot.endDate, "DD-MM-YY: hh:mma");

    const currentDateTime = moment();
    const isDateAfterStartDate = currentDateTime.isSameOrAfter(
      moment(startdate),
    );
    const isDateBeforeEndDate = currentDateTime.isSameOrBefore(moment(enddate));

    if (!(isDateAfterStartDate && isDateBeforeEndDate)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: httpStatus.BAD_REQUEST,
        message: "Current date/time is not within the report slot's range",
      });
    }

    const reportId = new Types.ObjectId();
    const fileId = await storeReportFile(file.originalname, file.buffer);
    let report;
    try {
      report = await ReportService.createReport({
        _id: reportId,
        filename: req.body.filename.trim(),
        fileDescription: req.body.fileDescription.trim(),
        userId,
        slotId,
        fileId,
        fileUrl: `reports/${reportId}/file`,
      });
    } catch (error) {
      await reportFiles().delete(fileId).catch(() => {
        console.error("Failed to remove an unlinked report attachment.");
      });
      throw error;
    }

    NotificationService.createNotification({
      message: "Report Submitted",
      notificationType: "reportsubmitted",
      userId: userId,
    } as Notification);

    res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: "Report Submitted successfully",
      data: report,
    });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      data: error,
    });
  }
}

export async function viewReportFile(req: Request, res: Response) {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Report file not found." });
  }

  try {
    const report = await ReportModel.findOne({
      _id: id,
      userStatus: "active",
      ...(res.locals.user.role === Role.Admin ? {} : { userId: res.get("userId") }),
    });

    if (!report) return res.status(404).json({ message: "Report file not found." });

    res.set("Cache-Control", "private, no-store");
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Access-Control-Expose-Headers", "Content-Disposition");

    if (!report.fileId) {
      const legacyName = /^uploads[\\/]([^\\/]+)$/.exec(report.fileUrl || "")?.[1];
      if (!legacyName || legacyName === "." || legacyName === "..") {
        return res.status(404).json({ message: "Report file not found." });
      }
      res.attachment(legacyName).type("application/octet-stream");
      return res.sendFile(legacyName, { root: legacyUploadsDirectory }, (error) => {
        if (error && !res.headersSent) {
          res.removeHeader("Content-Disposition");
          res.status(404).json({ message: "This older attachment is unavailable." });
        }
      });
    }

    const bucket = reportFiles();
    const file = await bucket.find({ _id: report.fileId }).next();
    if (!file) return res.status(404).json({ message: "Report file not found." });

    res.attachment(file.filename);
    // Only passive formats are shown inline. Other formats are downloaded.
    const type = res.get("Content-Type") || "";
    if (!/^(application\/pdf|image\/(png|jpeg|gif|webp)|text\/plain)(;|$)/.test(type)) {
      res.type("application/octet-stream");
    }
    await pipeline(bucket.openDownloadStream(file._id), res);
  } catch {
    if (!res.headersSent && !res.destroyed) {
      res.removeHeader("Content-Disposition");
      res.status(500).json({ message: "Unable to open the report file." });
    }
  }
}

export async function fetchReport(req: Request, res: Response) {
  try {
    const id = res.get("userId")!;
    const { page, limit } = req.query;
    const reports = await ReportService.fetchReports(
      id,
      parseInt(page as string),
      parseInt(limit as string),
    );
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Reports is fetched successfully",
      data: reports,
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function fetchAllReport(req: Request, res: Response) {
  try {
    const { page, limit } = req.query;

    const reports = await ReportService.fetchAllReport(
      parseInt(page as string),
      parseInt(limit as string),
    );

    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Reports is fetched successfully",
      data: reports,
    });
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
    if (res.locals.user.role !== Role.Admin) {
      return res.status(403).json({ message: "Administrator access required." });
    }
    if (typeof req.body.remarks !== "string") {
      return res.status(400).json({ message: "Provide report remarks." });
    }
    const report = await ReportService.findReportByIdAndUpdate(id, {
      remarks: req.body.remarks,
    });

    if (report && report.userStatus == "active") {
      report.status = "completed";
      report.save();

      NotificationService.createNotification({
        message: "Your Report Reviewed & Remarked by Admin",
        notificationType: "reportRemarked",
        userId: report.userId,
      } as Notification);

      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "Report remarked successfully",
        data: report,
      });
    } else {
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
    const report = await ReportService.findReportById(id);

    if (report) {
      report.userStatus = "deleted";
      report.save();
      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "Report deleted successfully",
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
