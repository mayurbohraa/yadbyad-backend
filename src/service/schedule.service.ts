import ScheduleModel, { Schedule } from "../models/schedule.model";

/**
 * @description This function is used to create Schedule
 * @author Keshav suman
 * @param {Object} scheduleDto
 * @returns {Promise<Schedule>}
 */
export async function schedule(scheduleDto: any): Promise<Schedule> {
  return await ScheduleModel.create(scheduleDto);
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
