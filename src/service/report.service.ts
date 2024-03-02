import { ReportModel } from "../models";
import reportModel, { Report } from "../models/report.model";
import jsonwebtoken from "jsonwebtoken";

import bcrypt from "bcryptjs";
import { ObjectId } from 'mongodb';


/**
 * @description this function creates a report in database
 * @param {Report} report
 * @author Kunal Rathod
 * @returns {Promise<Report>}
 */

export async function createReport(report: any){
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
 * @description This function is used to find a report by id
 * @param {String} id
 * @author Kunal Rathod
 * @returns {Promise<Report|null>}
 */

export async function findReportById(id: string): Promise<Report | null> {
  const objectId = new ObjectId(id);
  return await ReportModel.findOne({ _id: objectId });
}

/**
 * @description This function is used to update report details by using id
 * @param {String} _id
 * @author Kunal Rathod
 * @returns {Promise<Report|null>}
 */


export async function findUserByIdAndUpdate(id: string, report: Report): Promise<Report | null> {
  // Convert the string id to ObjectId
  const objectId = new ObjectId(id);

  // Find the user by _id
  const existingReport = await ReportModel.findOne({ _id: objectId });

  if (!existingReport) {
    return null; // User not found
  }

  // Update the user's details
  await ReportModel.updateOne({ _id: objectId },report);

  // Return the updated user
  return await ReportModel.findOne({ _id: objectId });
}


// /**
//  * @description This function is used to delete report by using id
//  * @param {String} _id
//  * @author Kunal Rathod
//  * @returns {Promise<boolean|null>}
//  */
// export async function deleteUserById(id: string): Promise<boolean> {
//   // Convert the string id to ObjectId
//   const objectId = new ObjectId(id);

//   // Find the user by _id and delete them
//   const result = await ComplainModel.deleteOne({ _id: objectId });

//   // Check if the deletion was successful
//   return result.deletedCount === 1;
// }
