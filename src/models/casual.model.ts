import mongoose, { Schema, Document } from "mongoose";

export interface Casual extends Document {
  date: string;
  time: string;
  bookedRoom: string;
  desc: string;
  type: string;
  status: string;
  specialNeedStatus:string;
  updatedAt: Date;
  createdAt: Date;
}
export enum Status {
  Accepted = "accepted",
  Pending = "pending",
  Rejected = "rejected",
}

export enum specialNeedStatus {
  Accepted = "accepted",
  Pending = "pending",
  Rejected = "rejected",
}

const casualSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    date: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    bookedRoom: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Status,
      default: "pending",
    },

    specialNeedStatus: {
      type: String,
      enum: specialNeedStatus,
      default: "pending",
    },

    requesteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Casual>("casual", casualSchema);
