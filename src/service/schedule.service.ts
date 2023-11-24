import ScheduleModel from "../models/schedule.model";

export async function schedule(scheduleDto: any) {
  return await ScheduleModel.create(scheduleDto);
}
