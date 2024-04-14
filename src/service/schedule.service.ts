import ScheduleModel, { Schedule } from "../models/schedule.model";
import moment from "moment";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";

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
  return await ScheduleModel.find({ userId }).populate({
    path: "slotRequestId",
    model: "slotrequest",
  });;
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

export async function requestUpdateSpecialNeed(
  requestId: string,
  updateRequestDto: any
): Promise<any> {
  return await ScheduleModel.findByIdAndUpdate(
    new Types.ObjectId(requestId),
    { $set: { specialNeedStatus: updateRequestDto } },
    { new: true }
  );
}

export async function Casual(scheduleDto: any): Promise<Schedule> {
  console.log(scheduleDto);
  return await ScheduleModel.create({
    ...scheduleDto,
    startTime: moment(scheduleDto.startTime, "hh:mma").toDate(),
    endTime: moment(scheduleDto.endTime, "hh:mma").toDate(),
  });
}

export async function CasualByAdmin(): Promise<Schedule[]> {
  const schedules = await ScheduleModel.find({
    type: "casual",
    dropStatus: "open",
  }).populate("userId", "-password");
 
  return schedules;
}

export async function CasualByUserId(userId: string): Promise<Schedule[]> {
  return await ScheduleModel.find({ userId });
}

export async function CasualAccepted(): Promise<Schedule[]> {
  return await ScheduleModel.find({ status: "accepted" }).populate({
    path: "userId",
    model: "users",
  });
}

export async function findCasualById(id: string): Promise<Schedule | null> {
  // Convert the string id to ObjectId
  const objectId = new ObjectId(id);

  // Return the updated casual
  return await ScheduleModel.findOne({ _id: objectId }).populate({
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

export async function createLectures(scheduleDto: any): Promise<Schedule[]> {
  const schedules: Schedule[] = [];
  
  // Convert scheduleDto.dates to an array if it's not already an array
  const dates = Array.isArray(scheduleDto.date) ? scheduleDto.date : [scheduleDto.date];

  for (const date of dates) {
    const schedule = await ScheduleModel.create({
      ...scheduleDto,
      date: date,
      startTime: moment(scheduleDto.startTime, "hh:mma").toDate(),
      endTime: moment(scheduleDto.endTime, "hh:mma").toDate(),
      
    });
    schedules.push(schedule);
  }

  return schedules;
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


export async function findDatesForSelectedDaysInMonth(selectedDays: string[], month: string) {
  // Initialize an empty array to store dates
  const dates: string[] = [];

  // Get the current date
  const currentDate = moment();

  // Loop through selected days
  selectedDays.forEach(day => {
    // Get the first occurrence of the selected day in the given month
    let currentDate = moment(`${month}-01`, 'YYYY-MM-DD');
    const selectedDayOfWeek = moment().day(day).day();
    while (currentDate.day() !== selectedDayOfWeek) {
      currentDate.add(1, 'day');
    }

    // Add all occurrences of the selected day in the given month to the dates array
    while (currentDate.month() === moment(month, 'YYYY-MM').month()) {
      if (currentDate.isSameOrAfter(moment(), 'day')) {
        dates.push(currentDate.format('YYYY-MM-DD'));
      }
      currentDate.add(7, 'days');
    }
  });

  return dates;
}




