import mongoose, { Schema, Document } from "mongoose";

export interface Lecture extends Document {
  date: string;
  time: string;
  bookedRoom: string;
  fCourse: string;
  courseTitle: string;
  specialNeedsStudentName: string;
  specialNeedsStudentID: string;
  type: string;
  specialNeedsStudentPhoneNumber: string;
  updatedAt: Date;
  createdAt: Date;
}

const lectureSchema: Schema = new Schema(
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
    fCourse: {
      type: String,
      required: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    specialNeedsStudentName: {
      type: String,
      required: true,
    },
    specialNeedsStudentID: {
      type: String,
      required: true,
    },
    specialNeedsStudentPhoneNumber: {
      type: String,
      required: true,
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

export default mongoose.model<Lecture>("lecture", lectureSchema);
