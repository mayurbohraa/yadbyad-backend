import lectureModel, { Lecture } from "../models/lecture.model";
import moment from "moment";

export async function lecture(scheduleDto: any): Promise<Lecture> {
  return await lectureModel.create({
    ...scheduleDto,
    startTime: moment(scheduleDto.startTime, "hh:mma").toDate(),
    endTime: moment(scheduleDto.endTime, "hh:mma").toDate(),
  });
}

export async function lectureByAdmin(): Promise<Lecture[]> {
  return await lectureModel.find({}).populate({
    path: "userId",
    model: "users",
  });
}

export async function lectureByUserId(userId: string): Promise<Lecture[]> {
  return await lectureModel.find({ userId });
}
