import ScheduleModel, { Schedule } from "../models/schedule.model";
import { RequestModel } from "../models";
import moment from "moment";
import { Request } from "../models/request.model";

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

/**
 * @description This function is used to create Request
 * @author Keshav suman
 * @param {Object} scheduleDto
 * @returns {Promise<Request>}
 */
export async function request(requestDto: any): Promise<any> {
  return await RequestModel.create({
    ...requestDto,
    startTime: moment(requestDto.startTime, "hh:mma").toDate(),
    endTime: moment(requestDto.endTime, "hh:mma").toDate(),
  });
}

/**
 * @description This function is used to fetch the requests
 * @author Keshav suman
 * @param {String} userId
 * @returns {Promise<any>}
 */
export async function requestByUserId(userId: string) {
  return await RequestModel.find({ userId });
}
