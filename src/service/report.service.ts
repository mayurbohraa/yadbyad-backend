import { ReportModel, ReportSlotModel } from "../models";
import { Report } from "../models/report.model";
import { ReportSlot } from "../models/reportSlot.model";
import jsonwebtoken from "jsonwebtoken";
import { ObjectId } from "mongodb";

/**
 * @description this function creates a report in database
 * @param {Report} report
 * @author Kunal Rathod
 * @returns {Promise<Report>}
 */

export async function createReport(report: any): Promise<Report> {
  return await ReportModel.create(report);
}

/**
 * @description This function is used to generate authenticaton token
 * @param {Report} report
 * @author Kunal Rathod
 * @returns {Promise<Report>}
 */
export function generateToken(report: Report): string {
  return jsonwebtoken.sign(report, process.env.JWT_Token!);
}

/**
 * @description This function is used to list all reports
 * @author Kunal Rathod
 * @param {number} page
 * @param {number} limit
 * @param {String} id
 * @returns {Promise<any>}
 */
export async function fetchReports(
  id: string,
  page: number,
  limit: number
): Promise<any> {
  const objectId = new ObjectId(id);
  return await ReportModel.find({ userId: objectId, userStatus: "active" })
    .limit(limit)
    .skip((page - 1) * limit)
    .populate({ path: "slotId", model: "reportSlot" })
    .populate({ path: "userId", model: "users" });
}

/**
 * @description This function is used to list all reports
 * @author Kunal Rathod
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<any>}
 */
export async function fetchAllReport(
  page: number,
  limit: number
): Promise<any> {
  return await ReportModel.find({
    userStatus: "active",
  })
    .limit(limit)
    .skip((page - 1) * limit)
    .populate({ path: "userId", model: "users" })
    .populate({ path: "slotId", model: "reportSlot" });
}

/**
 * @description This function is used to find a report by id
 * @param {String} id
 * @author Kunal Rathod
 * @returns {Promise<Report|null>}
 */

export async function findReportById(id: string): Promise<Report | null> {
  const objectId = new ObjectId(id);
  return await ReportModel.findOne({ _id: objectId }).populate({
    path: "userId",
    model: "users",
  });
}

/**
 * @description This function is used to find a reportSlot by id
 * @param {String} slotId
 * @author Kunal Rathod
 * @returns {Promise<ReportSlot|null>}
 */

export async function findReportSlotById(
  slotId: string
): Promise<ReportSlot | null> {
  const objectId = new ObjectId(slotId);
  return await ReportSlotModel.findOne({ _id: objectId }).populate({
    path: "userId",
    model: "users",
  });
}
/**
 * @description This function is used to update report details by using id
 * @param {String} _id
 * @author Kunal Rathod
 * @returns {Promise<Report|null>}
 */

export async function findReportByIdAndUpdate(
  id: string,
  report: Report
): Promise<Report | null> {
  // Convert the string id to ObjectId
  const objectId = new ObjectId(id);

  // Find the user by _id
  const existingReport = await ReportModel.findOne({ _id: objectId });

  if (!existingReport) {
    return null; // User not found
  }

  // Update the user's details
  await ReportModel.updateOne({ _id: objectId }, report);

  // Return the updated user
  return await ReportModel.findOne({ _id: objectId }).populate({
    path: "userId",
    model: "users",
  });
}

