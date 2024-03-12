import { Request, Response } from "express";
import httpStatus from "http-status";
import { Report } from "../models/report.model";
import {
  ReportService,
  SettingsService,
  AuthenticationService,
} from "../service";
import moment from "moment";

export async function submitReport(req: Request, res: Response) {
  console.log(req);
  try {
    const { slotId } = req.params;
    const userId = res.get("userId")!;
    const file = req.file;

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
      moment(startdate)
    );
    const isDateBeforeEndDate = currentDateTime.isSameOrBefore(moment(enddate));

    if (!(isDateAfterStartDate && isDateBeforeEndDate)) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: httpStatus.BAD_REQUEST,
        message: "Current date/time is not within the report slot's range",
      });
    }

    const report = await ReportService.createReport({
      ...req.body,
      userId: userId,
      fileUrl: file!.path,
      slotId: slotId,
    });

    res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: "File uploaded successfully",
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

export async function fetchReport(req: Request, res: Response) {
  try {
    const id = res.get("userId")!;
    const { page, limit } = req.query;
    const reports = await ReportService.fetchReports(
      id,
      parseInt(page as string),
      parseInt(limit as string)
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
      parseInt(limit as string)
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
    const report = await ReportService.findUserByIdAndUpdate(id, {
      ...req.body,
    });

    if (report && report.userStatus == "active") {
      report.status = "completed";
      report.save();
      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "Report is replied successfully",
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
