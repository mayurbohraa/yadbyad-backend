import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Accepted = "accepted",
  Pending = "pending",
  Rejected = "rejected",
}

export enum userStatus {
  Active = "active",
  Deleted = "deleted",
}

export interface Report extends Document {
  userId:string;
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
      default: "pending",
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
