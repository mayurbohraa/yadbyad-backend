import mongoose, { Schema, Document } from "mongoose";

export enum ScheduleType {
  Leacture = "lecture",
  Exam = "exam",
}

export interface Schedule extends Document {
  subject: string;
  scheduleType: string;
  scheduleDate: Date;
  startTime: Date;
  endTime: Date;
  location: string;
  updatedAt: Date;
  createdAt: Date;
}

const scheduleSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    subject: {
      type: String,
    },
    scheduleType: {
      type: String,
      enum: ScheduleType,
    },
    scheduleDate: {
      type: Date,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Schedule>("schedule", scheduleSchema);
