import ScheduleModel, { Schedule } from "../models/schedule.model";
import moment from "moment";
/**
 * @description This function is used to create Schedule
 * @author Keshav suman
 * @param {Object} scheduleDto
 * @returns {Promise<Schedule>}
 */
export async function schedule(scheduleDto: any): Promise<Schedule> {
  return await ScheduleModel.create({
    ...scheduleDto,
    startTime: moment(scheduleDto.startTime, "hh:mma").toDate(),
    endTime: moment(scheduleDto.endTime, "hh:mma").toDate(),
  });
}

/**
 * @description This function is used to fetch the list of schedule by user Id
 * @author Keshav suman
 * @param {String} userId
 * @returns {Promise<Schedule[]>}
 */
export async function scheduleByUserId(userId: string): Promise<Schedule[]> {
  return await ScheduleModel.find({ userId });
}

/**
 * @description This function is used to fetch the list of matches
 * @author Keshav suman
 * @param {String} userId
 * @returns {Promise<any>}
 */
export async function fetchMatches(
  subject: String,
  scheduleDate: Date,
  startTime: Date,
  endTime: Date
): Promise<any> {
  return await ScheduleModel.find({
    subject: { $or: [subject, ""] },
    scheduleDate,
    startTime,
    endTime,
  }).populate({
    path: "userId",
    model: "user",
  });
}
