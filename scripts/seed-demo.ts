import { createHash } from "node:crypto";
import dns from "node:dns";
import { mkdir, writeFile } from "node:fs/promises";

import dotenv from "dotenv";
import mongoose, { Model, Types } from "mongoose";

import {
  ComplainModel,
  NotificationModel,
  ReportModel,
  ReportSlotModel,
  ResourceModel,
  ScheduleModel,
  UserModel,
} from "../src/models";
import { NotificationType } from "../src/models/notification.model";
import SlotRequestModel from "../src/models/slot-requests.model";
import { Role } from "../src/models/user.model";

dotenv.config();

async function seedDemo() {
  const [adminUsername, studentUsername, helperUsername] = process.argv.slice(2);
  if (!adminUsername || !studentUsername || !helperUsername || !process.env.DB_URL) {
    throw new Error("Set DB_URL and provide the admin, special needs, and part-time demo usernames.");
  }

  if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()));
  }
  await mongoose.connect(process.env.DB_URL.trim(), { serverSelectionTimeoutMS: 10000 });

  const accounts = await Promise.all(
    [[adminUsername, Role.Admin], [studentUsername, Role.SpecialNeed], [helperUsername, Role.PartTime]].map(
      ([username, role]) => UserModel.findOne({ username, role, status: "active" }),
    ),
  );
  const [admin, student, helper] = accounts;
  if (!admin || !student || !helper) {
    throw new Error("Each username must match an active account with the specified role.");
  }

  const now = new Date();
  const day = (offset: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    return date;
  };
  const id = (key: string) =>
    new Types.ObjectId(createHash("sha256").update(`yadbyad-demo:${admin._id}:${student._id}:${helper._id}:${key}`).digest("hex").slice(0, 24));

  // Stable IDs make interrupted runs safe to retry without replacing edited records.
  const insert = (model: Model<any>, key: string, fields: Record<string, unknown>) =>
    model.updateOne(
      { _id: id(key) },
      { $setOnInsert: { ...fields, createdAt: now, updatedAt: now } },
      { upsert: true, runValidators: true, timestamps: false },
    );

  const events = [
    { key: "lecture", title: "Database Systems", code: "CS204", status: "accepted", offset: 1 },
    { key: "exam", title: "Applied Statistics", code: "MA210", status: "pending", offset: 3 },
    { key: "casual", title: "Programming Practice", code: "CS102", status: "rejected", offset: 5 },
  ];

  for (const event of events) {
    const scheduleDate = day(event.offset);
    const date = scheduleDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    await insert(ScheduleModel, event.key, {
      userId: student._id,
      specialNeedsStudentID: student.studentID,
      type: event.key,
      courseTitle: event.title,
      fCourse: event.code,
      scribeTask: "Take notes during the session",
      bookedRoom: "Library Study Room 2",
      date,
      startTime: new Date(date + "T10:00:00+05:30"),
      endTime: new Date(date + "T11:00:00+05:30"),
      ...(event.key === "casual" && { status: "accepted" }),
      ...(event.status === "accepted" && {
        slotRequestId: id(event.key + "-match"),
        requesteeId: helper._id,
        specialNeedStatus: "accepted",
      }),
    });
    await insert(SlotRequestModel, event.key + "-match", {
      userId: student._id,
      requesteeId: helper._id,
      eventId: id(event.key),
      type: event.key,
      status: event.status,
    });
  }

  await mkdir("uploads", { recursive: true });
  const reports = [
    { key: "database", title: "Database revision session", description: "Reviewed joins and practiced writing queries.", reviewed: true },
    { key: "study-skills", title: "Study planning session", description: "Prepared an accessible revision checklist.", reviewed: false },
  ];

  for (const report of reports) {
    const filename = `demo-${id(report.key)}.txt`;
    await writeFile("uploads/" + filename, report.title + "\n\n" + report.description + "\n");
    await insert(ReportSlotModel, report.key + "-slot", {
      title: report.title,
      userId: admin._id,
      startDate: day(-2),
      endDate: day(14),
      status: "open",
    });
    await insert(ReportModel, report.key + "-report", {
      userId: helper._id,
      slotId: id(report.key + "-slot"),
      fileUrl: "uploads/" + filename,
      filename,
      fileDescription: report.description,
      status: report.reviewed ? "completed" : "processing",
      ...(report.reviewed && { remarks: "Clear notes and practical next steps." }),
    });
  }

  await insert(ResourceModel, "sql-resource", {
    title: "Database revision guide",
    description: "Practice selecting, joining, and grouping records before the peer session.",
    url: "https://www.postgresql.org/docs/current/tutorial-sql.html",
  });

  for (const account of [student, helper]) {
    await insert(ComplainModel, "open-complaint-" + account.role, {
      userId: account._id,
      subject: "Study room availability",
      message: "Could we confirm the room is available before the next session?",
    });
    await insert(ComplainModel, "resolved-complaint-" + account.role, {
      userId: account._id,
      subject: "Updated session time",
      message: "The original session time clashed with a lecture.",
      replyMessage: "The session was moved and both participants were informed.",
      status: "completed",
    });
  }

  await UserModel.updateOne(
    { _id: student._id, recoveryRequestStatus: { $exists: false } },
    { $set: { recoveryRequestStatus: "pending", recoveryRequestedAt: now } },
  );
  const approved = await UserModel.updateOne(
    { _id: helper._id, recoveryRequestStatus: { $exists: false } },
    { $set: { recoveryRequestStatus: "approved", recoveryRequestedAt: day(-1), recoveryApprovedAt: now } },
  );
  if (approved.modifiedCount || await UserModel.exists({ _id: helper._id, recoveryRequestStatus: "approved" })) {
    await insert(NotificationModel, "recovery-approved", {
      userId: helper._id,
      message: "Your account recovery request was accepted.",
      notificationType: NotificationType.accountRecoveryAccepted,
    });
  }
  await insert(NotificationModel, "report-submitted", {
    userId: helper._id,
    message: "A study planning session report is ready for review.",
    notificationType: NotificationType.reportSubmitted,
  });
  await insert(NotificationModel, "match-request", {
    userId: student._id,
    message: "You have a new match request for Applied Statistics.",
    notificationType: NotificationType.partTimeCasualExamLectureRequest,
  });
  console.log("Demo records are ready for all three accounts.");
}

seedDemo()
  .catch((error: unknown) => {
    const message = error instanceof mongoose.Error || !(error instanceof Error)
      ? "Unable to seed the demo database."
      : error.message;
    console.error(message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
