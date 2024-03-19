import ScheduleModel, { Schedule } from "../models/exam.model";
import { RequestModel } from "../models";
import moment from "moment";
import { Request } from "../models/request.model";
import { Types } from "mongoose";

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
 * @description This function is used to fetch the list of schedule by admin
 * @author Keshav suman
 * @returns {Promise<Schedule[]>}
 */
export async function scheduleByAdmin(): Promise<Schedule[]> {
  return await ScheduleModel.find({}).populate({
    path: "userId",
    model: "users",
  });
}

export async function requestUpdate(
  requestId: string,
  updateRequestDto: any
): Promise<any> {
  return await ScheduleModel.findByIdAndUpdate(
    new Types.ObjectId(requestId),
    { $set: { status: updateRequestDto } },
    { new: true }
  );
}

export async function Casual(scheduleDto: any): Promise<Schedule> {
  return await ScheduleModel.create({
    ...scheduleDto,
    startTime: moment(scheduleDto.startTime, "hh:mma").toDate(),
    endTime: moment(scheduleDto.endTime, "hh:mma").toDate(),
  });
}

export async function CasualByAdmin(): Promise<Schedule[]> {
  return await ScheduleModel.find({}).populate("userId", "-password");
}

// export async function CasualByAdmin(): Promise<Casual[]> {
//   return await casualModel.find({}).populate("userId", "-password");
// }

export async function CasualByUserId(userId: string): Promise<Schedule[]> {
  return await ScheduleModel.find({ userId });
}

export async function CasualAccepted(): Promise<Schedule[]> {
  return await ScheduleModel.find({ status: "accepted" }).populate({
    path: "userId",
    model: "users",
  });
}

export async function lecture(scheduleDto: any): Promise<Schedule> {
  return await ScheduleModel.create({
    ...scheduleDto,
    startTime: moment(scheduleDto.startTime, "hh:mma").toDate(),
    endTime: moment(scheduleDto.endTime, "hh:mma").toDate(),
  });
}

export async function lectureByAdmin(): Promise<Schedule[]> {
  return await ScheduleModel.find({}).populate({
    path: "userId",
    model: "users",
  });
}

export async function lectureByUserId(userId: string): Promise<Schedule[]> {
  return await ScheduleModel.find({ userId });
}
