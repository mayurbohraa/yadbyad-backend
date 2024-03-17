import mongoose, { Schema, Document } from "mongoose";


export enum NotificationType {
  reportSubmitted= "reportsubmitted",
  complainSubmitted = "complainsubmitted",
  reportSlotCreated = "reportSlotCreated",
  complainReplied = "complainReplied",
  reportRemarked = "reportRemarked",
  reportSlotDeleted = "reportSlotDeleted",
  resourcecreated ="resourcecreated",
  resourceedited = "resourceedited"
}

export interface Notification extends Document {
  
  message:string;
  isRead:boolean;
  notificationType:string;
  updatedAt: Date;
  createdAt: Date;
  userId:string
}



const notificationSchema: Schema = new Schema(
  {
    message: {
      type: String,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    notificationType: {
      type: String,
      enum: NotificationType,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Notification>("notification", notificationSchema);
