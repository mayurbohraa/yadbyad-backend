import mongoose, { Schema, Document } from "mongoose";

export enum Role {
  Admin = "admin",
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
  recoveryCodeEncrypted?: string;
  recoveryFailedAttempts: number;
  recoveryLockedUntil?: Date;
  recoveryRequestedAt?: Date;
  recoveryRequestStatus?: "pending" | "approved";
  recoveryApprovedAt?: Date;
  authVersion: number;
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
    recoveryCodeEncrypted: { type: String, select: false },
    recoveryFailedAttempts: { type: Number, default: 0, select: false },
    recoveryLockedUntil: { type: Date, select: false },
    recoveryRequestedAt: { type: Date, select: false },
    recoveryRequestStatus: {
      type: String,
      enum: ["pending", "approved"],
      select: false,
    },
    recoveryApprovedAt: { type: Date, select: false },
    authVersion: { type: Number, default: 0 },
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
    toJSON: {
      transform(_doc, ret) {
        const result = ret as unknown as Record<string, unknown>;
        for (const key of [
          "password",
          "recoveryCodeEncrypted",
          "recoveryFailedAttempts",
          "recoveryLockedUntil",
          "recoveryRequestedAt",
        ])
          delete result[key];
        return ret;
      },
    },
  },
);

export default mongoose.model<User>("users", userSchema);
