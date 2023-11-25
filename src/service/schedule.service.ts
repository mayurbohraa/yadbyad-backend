import ScheduleModel, { Schedule } from "../models/schedule.model";
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
  return await ScheduleModel.find({}
    ).populate({
      path: "userId",
      model: "users",
    });
}


/**
 * @description This function is used to fetch the list of matches
 * @author Keshav suman
 * @param {String} userId
 * @returns {Promise<any>}
 */
export async function fetchMatchesSNS(
  subject: String,
  scheduleDate: Date,
  startTime: Date,
  endTime: Date
): Promise<any> {
  return await ScheduleModel.find({
    $or: [
      { subject: { $exists: false } },
      { subject: subject }
    ],
    scheduleDate,
    startTime,
    endTime,
  }
  ).populate({
    path: "userId",
    model: "users",
  });
}

/**
 * @description This function is used to fetch the list of matches
 * @author Keshav suman
 * @param {String} userId
 * @returns {Promise<any>}
 */
export async function fetchMatchesPTS(
  subject: String,
  scheduleDate: Date,
  startTime: Date,
  endTime: Date
): Promise<any> {
  return await ScheduleModel.find({
    $or: [
      { subject: { $exists: true } },
      { subject: subject }
    ],
    scheduleDate,
    startTime,
    endTime,
  }
  ).populate({
    path: "userId",
    model: "users",
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
  return await RequestModel.find({ userId }
    ).populate({
      path: "userId",
      model: "users",
    });
}

/**
 * @description This function is used to fetch the requests for admin
 * @author Keshav suman
 * @returns {Promise<any>}
 */
export async function requestByAdmin() {
  return await RequestModel.find({}
    ).populate({
      path: "userId",
      model: "users",
    });
}


/**
 * @description This function updated the Request
 * @author keshav suman
 * @param {String} requestId
 * @param {Object} updateRequestDto
 * @returns {Promise<any>}
 */

export async function requestUpdate(requestId: string, updateRequestDto: any) {
  return await RequestModel.findByIdAndUpdate(
    new Types.ObjectId(requestId),
    updateRequestDto,
    { new: true }
  );
}
