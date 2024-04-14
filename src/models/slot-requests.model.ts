import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Accepted = "accepted",
  Pending = "pending",
  Rejected = "rejected",
  Dropped = "dropped"
}

export enum dropStatus {
  open = "open",
  deleted = "deleted",
}

export interface SlotRequest extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  requesteeId: mongoose.Schema.Types.ObjectId;
  status: string;
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
