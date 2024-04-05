import slotModel, { SlotRequest } from "../models/slot-requests.model";
import examModel, { Schedule } from "../models/exam.model";
import lectureModel, { Lecture } from "../models/lecture.model";
import casualModel, { Casual } from "../models/casual.model";
import moment from "moment";
import { Types } from "mongoose";

export async function requestUpdate(
  requestId: string,
  requesteeId: string,
  eventId: string,
  updateRequestDto: any
): Promise<any> {
  if (updateRequestDto === "accepted") {
    await examModel.findByIdAndUpdate(eventId, { requesteeId }, { new: true });
  } else {
    await examModel.findByIdAndUpdate(
      eventId,
      { requesteeId: null },
      { new: true }
    );
  }
  return await slotModel.findByIdAndUpdate(
    new Types.ObjectId(requestId),
    { $set: { status: updateRequestDto } },
    { new: true }
  );
}

export async function Reuest(scheduleDto: any): Promise<SlotRequest> {
  return await slotModel.create({
    ...scheduleDto,
    startTime: moment(scheduleDto.startTime, "hh:mma").toDate(),
    endTime: moment(scheduleDto.endTime, "hh:mma").toDate(),
  });
}

export async function ReuestByAdmin(): Promise<SlotRequest[]> {
  return await slotModel.find({}).populate("userId", "-password");
}

// export async function CasualByAdmin(): Promise<Casual[]> {
//   return await casualModel.find({}).populate("userId", "-password");
// }

export async function ReuestByUserId(userId: string): Promise<SlotRequest[]> {
  return await slotModel.find({ userId }).populate("requesteeId", "-password").populate("eventId");;
}

export async function ReuestByPtUserId(userId: string): Promise<SlotRequest[]> {
  return await slotModel
    .find({ requesteeId: userId })
    .populate("eventId");
}

export async function ReuestAcceptedPt(userId: string): Promise<SlotRequest[]> {
  return await slotModel
    .find({ status: "accepted", requesteeId: userId })
    .populate("userId", "-password")
    .populate("requesteeId", "-password")
    .populate("eventId");
}
export async function ReuestAcceptedSn(userId: string): Promise<SlotRequest[]> {
  return await slotModel
    .find({ status: "accepted", userId: userId })
    .populate("requesteeId", "-password")
    .populate("userId", "-password")
    .populate("eventId");
}
