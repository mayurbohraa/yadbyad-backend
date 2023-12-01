import mongoose, { Schema, Document } from "mongoose";

export enum Role {
  PartTime = "part_time",
  SpecialNeed = "special_need",
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<User>("users", userSchema);
