import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Processing = "processing",
  Completed = "completed",
}

export interface Complain extends Document {
  subject:string,
  message:string,
  replyMessage: string
  status: Status;
  updatedAt: Date;
  createdAt: Date;
}

const complainSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    subject: {
      type: String,
    },

    message: {
      type: String,
    },

    replyMessage: {
      type: String,
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Complain>("complain", complainSchema);
