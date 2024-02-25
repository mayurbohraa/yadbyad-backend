import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Accepted = "accepted",
  Pending = "pending",
  Rejected = "rejected",
}

export interface Report extends Document {
  file:{
    url: String;
    filename: String;
};
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

    file: {
        url: String,
        filename: String,
    },

    fileDescription: {
        type: String,
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

export default mongoose.model<Report>("Report", reportSchema);
