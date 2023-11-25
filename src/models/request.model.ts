import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Accepted = "accepted",
  Pending = "pending",
  Rejected = "rejected",
}

export interface Request extends Document {
  request:string,
  scheduleDate: Date;
  startTime: Date;
  endTime: Date;
  status: Status;
  updatedAt: Date;
  createdAt: Date;
}

const requestSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    request: {
      type: String,
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
    status: {
      type: String,
      enum: Status,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Request>("request", requestSchema);
