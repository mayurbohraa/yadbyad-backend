import mongoose, { Schema, Document } from "mongoose";


export enum NotificationType {
  reportSubmitted= "reportsubmitted",
  complainSubmitted = "complainsubmitted",
  reportSlotCreated = "reportSlotCreated",
  complainReplied = "complainReplied",
  reportRemarked = "reportRemarked",
  reportSlotDeleted = "reportSlotDeleted",
  resourcecreated ="resourcecreated",
  resourceedited = "resourceedited",
  casualSessionRequested = "casualSessionRequested",
  examAdded = "examAdded",
  casualSessionAccepted = "casualSessionAccepted",
  lectureCreated= "lectureCreated",
  casualSessionAcceptedOrRejected = "casualSessionAcceptedOrRejected",
  partTimeCasualExamLectureRequest = "partTimeCasual/Exam/LectureRequest",
  casualexamlectureSessionAcceptedOrRejectedBySpecialNeed = "casual/exam/lectureSessionAcceptedOrRejectedBySpecialNeed",
  CasualExamLectureDeleted = "Casual/Exam/LectureDeleted",
  newStudentJoined = "newStudentJoined",
  resourcedeleted = "resourcedeleted",
  sessionDropped = "sessionDropped"
}

export interface Notification extends Document {
  
  message:string;
  isRead:boolean;
  readBy: [string];
  notificationType:string;
  updatedAt: Date;
  createdAt: Date;
  userId:any;
 
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

    readBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
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
