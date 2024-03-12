import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Active = "active",
  Deleted = "deleted",
}

export interface Resource extends Document {
  
  title: String;
  description: String;
  url:string;
  status: string;
  updatedAt: Date;
  createdAt: Date;
}

const resourceSchema: Schema = new Schema(
  {
    title: {
        type: String,
    },

    description: {
      type: String,
  },

    url: {
        type: String,
    },
    status: {
      type: String,
      enum: Status,
      default: "active",
    },

  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Resource>("resource", resourceSchema);
