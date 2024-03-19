import casualModel, { Casual } from "../models/casual.model";
import { RequestModel } from "../models";
import moment from "moment";
import { Types } from "mongoose";

export async function requestUpdate(
  requestId: string,
  updateRequestDto: any
): Promise<any> {
  return await casualModel.findByIdAndUpdate(
    new Types.ObjectId(requestId),
    { $set: { status: updateRequestDto } },
    { new: true }
  );
}

export async function Casual(scheduleDto: any): Promise<Casual> {
  return await casualModel.create({
    ...scheduleDto,
    startTime: moment(scheduleDto.startTime, "hh:mma").toDate(),
    endTime: moment(scheduleDto.endTime, "hh:mma").toDate(),
  });
}

export async function CasualByAdmin(): Promise<Casual[]> {
  return await casualModel.find({}).populate("userId", "-password");
}

// export async function CasualByAdmin(): Promise<Casual[]> {
//   return await casualModel.find({}).populate("userId", "-password");
// }

export async function CasualByUserId(userId: string): Promise<Casual[]> {
  return await casualModel.find({ userId });
}

export async function CasualAccepted(): Promise<Casual[]> {
  return await casualModel.find({ status: "accepted" }).populate({
    path: "userId",
    model: "users",
  });
}
