import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Accepted = "accepted",
  Pending = "pending",
  Rejected = "rejected",
}

export interface SlotRequest extends Document {
  userId: string;
  requesteeId: string;
  status: Status;
  updatedAt: Date;
  createdAt: Date;
  type: string;
}

const requestSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    requesteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    type: {
      type: String,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "schedule",
    },
    status: {
      type: String,
      enum: Status,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<SlotRequest>("slotrequest", requestSchema);
