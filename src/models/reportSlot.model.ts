import mongoose, { Schema, Document } from "mongoose";

// export enum ScheduleType {
//   Leacture = "lecture",
//   Exam = "exam",
// }

export interface reportSlot extends Document {
  title: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  updatedAt: Date;
  createdAt: Date;
}

const slotSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    title: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
   
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<reportSlot>("reportSlot", slotSchema);
