import mongoose, { Schema, Document } from "mongoose";

export enum specialNeedStatus {
  Accepted = "accepted",
  Pending = "pending",
  Rejected = "rejected",
}

export enum dropStatus {
  open = "open",
  deleted = "deleted",
}

// Common interface for all document types
export interface Schedule extends Document {
  userId: mongoose.Types.ObjectId;
  slotRequestId:mongoose.Types.ObjectId | null;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  bookedRoom: string;
  fCourse?: string;
  courseTitle?: string;
  scribeTask?: string;
  specialNeedsStudentName?: string;
  specialNeedsStudentID?: string;
  specialNeedsStudentPhoneNumber?: string;
  specialNeedStatus: string;
  dropStatus: string;
  requesteeId: string | null;
  status: string;
  updatedAt: Date;
  createdAt: Date;
}

// Combined schema for all event types
const eventSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    slotRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "slotrequest",
    },
    date: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    bookedRoom: {
      type: String,
      required: true,
    },
    fCourse: String,
    courseTitle: String,
    scribeTask: String,
    specialNeedsStudentID: String,

    specialNeedStatus: {
      type: String,
      enum: specialNeedStatus,
      default: "pending",
    },

    dropStatus: {
      type: String,
      enum: dropStatus,
      default: "open",
    },
    requesteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
    },
  },
  {
    timestamps: true,
  }
);

// Export the combined model
export default mongoose.model<Schedule>("schedule", eventSchema);
