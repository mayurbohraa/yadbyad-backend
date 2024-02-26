import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Accepted = "accepted",
  Pending = "pending",
  Rejected = "rejected",
}

export interface Report extends Document {
  fileUrl: String;
  filename: String;
  fileDescription:string;
  status: Status;
  updatedAt: Date;
  createdAt: Date;
}

const reportSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
    
    status: {
      type: String,
      enum: Status,
      default: "pending",
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

export default mongoose.model<Report>("reports", reportSchema);
