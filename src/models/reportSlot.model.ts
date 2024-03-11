import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Open = "open",
  Closed = "closed",
  
}
export interface ReportSlot extends Document {
  title: string;
  startDate: Date;
  endDate: Date;
  status:string;
  userId: mongoose.Schema.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const slotSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
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
    status: {
      type: String,
      enum: Status,
      default: "open"
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ReportSlot>("reportSlot", slotSchema);
