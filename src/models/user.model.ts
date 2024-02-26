import mongoose, { Schema, Document } from "mongoose";

export enum Role {
  PartTime = "part time student",
  SpecialNeed = "special need student",
}

export enum Status {
  Active = "active",
  Deleted = "deleted",
}

export interface User extends Document {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  major: string;
  username: string;
  studentID: string;
  isProfileCompleted: boolean;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  role: Role;
  gender: string;
  status: string;
  updatedAt: Date;
  createdAt: Date;
}

const userSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
    },
    username: {
      type: String,
    },
    studentID: {
      type: String,
    },
    major: {
      type: String,
    },
    email: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    gender: {
      type: String,
    },
    password: {
      type: String,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Role,
      default: Role.PartTime,
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

export default mongoose.model<User>("users", userSchema);
