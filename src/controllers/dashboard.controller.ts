import { Request, Response } from "express";
import {
  UserModel,
  ComplainModel,
  ReportModel,
  ResourceModel,
} from "../models";
import SlotRequestModel from "../models/slot-requests.model";
import { Role, User } from "../models/user.model";

export async function dashboardSummary(_req: Request, res: Response) {
  try {
    const user: User = res.locals.user;
    if (user.role === Role.Admin) {
      const [
        students,
        recoveryRequests,
        complaints,
        reports,
        approvedRecoveries,
        resolvedComplaints,
        reviewedReports,
      ] = await Promise.all([
        UserModel.countDocuments({
          status: "active",
          role: { $in: [Role.PartTime, Role.SpecialNeed] },
        }),
        UserModel.countDocuments({
          status: "active",
          recoveryRequestStatus: "pending",
        }),
        ComplainModel.countDocuments({
          userStatus: "active",
          status: "processing",
        }),
        ReportModel.countDocuments({
          userStatus: "active",
          status: "processing",
        }),
        UserModel.countDocuments({
          status: "active",
          recoveryRequestStatus: "approved",
        }),
        ComplainModel.countDocuments({
          userStatus: "active",
          status: "completed",
        }),
        ReportModel.countDocuments({
          userStatus: "active",
          status: "completed",
        }),
      ]);
      res.json({
        data: {
          students,
          recoveryRequests,
          complaints,
          reports,
          approvedRecoveries,
          resolvedComplaints,
          reviewedReports,
        },
      });
      return;
    }

    // Student totals are limited to records owned by either side of their match.
    const participant = {
      $or: [{ userId: user._id }, { requesteeId: user._id }],
    };
    const ownActiveRecords = { userId: user._id, userStatus: "active" };
    const isPartTime = user.role === Role.PartTime;
    const [
      matches,
      requests,
      complaints,
      extra,
      resolvedComplaints,
      reviewedReports,
      otherMatches,
    ] = await Promise.all([
      SlotRequestModel.countDocuments({ ...participant, status: "accepted" }),
      SlotRequestModel.countDocuments({ ...participant, status: "pending" }),
      ComplainModel.countDocuments({
        ...ownActiveRecords,
        status: "processing",
      }),
      isPartTime
        ? ReportModel.countDocuments(ownActiveRecords)
        : ResourceModel.countDocuments({ status: "active" }),
      ComplainModel.countDocuments({
        ...ownActiveRecords,
        status: "completed",
      }),
      isPartTime
        ? ReportModel.countDocuments({
            ...ownActiveRecords,
            status: "completed",
          })
        : undefined,
      SlotRequestModel.countDocuments({
        ...participant,
        status: { $in: ["rejected", "dropped"] },
      }),
    ]);
    res.json({
      data: {
        matches,
        requests,
        complaints,
        resolvedComplaints,
        otherMatches,
        ...(isPartTime
          ? { reports: extra, reviewedReports }
          : { resources: extra }),
      },
    });
  } catch {
    res
      .status(500)
      .json({ message: "Unable to load the dashboard. Please try again." });
  }
}
