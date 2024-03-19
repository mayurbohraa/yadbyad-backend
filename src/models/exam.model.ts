import mongoose, { Schema, Document } from "mongoose";

// Common interface for all document types
export interface Schedule extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  time: string;
  type: string;
  bookedRoom: string;
  fCourse?: string;
  courseTitle?: string;
  scribeTask?: string;
  specialNeedsStudentName?: string;
  specialNeedsStudentID?: string;
  specialNeedsStudentPhoneNumber?: string;
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
    fCourse: String,
    courseTitle: String,
    scribeTask: String,
    specialNeedsStudentName: String,
    specialNeedsStudentID: String,
    specialNeedsStudentPhoneNumber: String,
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
