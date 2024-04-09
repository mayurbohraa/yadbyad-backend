import reportSlotModel, { ReportSlot } from "../models/reportSlot.model";
import { Types } from "mongoose";

/**
 * @description this function creates a complain in database
 * @param {any} reportSlotDto
 * @author Kunal Rathod
 * @returns {Promise<ReportSlot>}
 */

export async function createSlot(reportSlotDto: any): Promise<ReportSlot> {
  return await reportSlotModel.create(reportSlotDto);
}

/**
 * @description this function fetches the repor slot
 * @param {Types.ObjectId} userId
 * @param {number} limit
 * @param {number} page
 * @param {string} role
 * @author Keshav suman
 * @returns {Promise<Array<ReportSlot>>}
 */

export async function getReportSlots(
  userId: Types.ObjectId,
  limit: number,
  page: number,
  role: string
): Promise<Array<ReportSlot>> {
  const matchObject: any = {};
  if (role === "admin") {
    matchObject.userId = userId;
  } else {
    matchObject.status = "open";
  }
  return await reportSlotModel
    .find(matchObject)
    .limit(limit)
    .skip(page * limit);
}

/**
 * @description this function delete the report slot
 * @param {Types.ObjectId} slotId
 * @author Keshav suman
 * @returns {Promise<ReportSlot|null>}
 */

export async function deleteReportSlot(
  slotId: Types.ObjectId
): Promise<ReportSlot | null> {
  return await reportSlotModel.findByIdAndUpdate(
    {
      _id: slotId,
    },
    {
      status: "deleted",
    },
    {
      new: true,
    }
  );
}

// Write a function for geting the report slot by id

/**
 * @description this function fetches the report slot by id
 * @param {Types.ObjectId} slotId
 * @returns {Promise<ReportSlot|null>}
 * @author Keshav suman
 */

export async function getReportSlotById(
  slotId: Types.ObjectId
): Promise<ReportSlot | null> {
  return await reportSlotModel.findById(slotId);
}
