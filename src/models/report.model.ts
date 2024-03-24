import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Processing = "processing",
  Completed = "completed",
  
}

export enum userStatus {
  Active = "active",
  Deleted = "deleted",
}

export interface Report extends Document {
  slotId:mongoose.Schema.Types.ObjectId;
  userId:mongoose.Schema.Types.ObjectId;
  fileUrl: String;
  filename: String;
  fileDescription:string;
  remarks: string;
  userStatus: string;
  status: string;
  updatedAt: Date;
  createdAt: Date;
}

const reportSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reportSlot",
    },

    fileUrl: {
        type: String,
    },

    filename: {
      type: String,
  },

    fileDescription: {
        type: String,
    },

    remarks: {
      type: String,
  },
    
    status: {
      type: String,
      enum: Status,
      default: "processing",
    },

  
    userStatus: {
      type: String,
      enum: userStatus,
      default:"active"
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Report>("report", reportSchema);
