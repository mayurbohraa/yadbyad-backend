import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Processing = "processing",
  Completed = "completed",
  
}
export enum userStatus {
  Active = "active",
  Deleted = "deleted",
}

export interface Complain extends Document {
  userId:mongoose.Schema.Types.ObjectId;
  userStatus: string;
  subject:string,
  message:string,
  replyMessage: string
  status: string;
  updatedAt: Date;
  createdAt: Date;
}



const complainSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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
      default: "processing"
    },
    userStatus: {
      type: String,
      enum: userStatus,
      default:"active"
    },

    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "user",
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Complain>("complain", complainSchema);
