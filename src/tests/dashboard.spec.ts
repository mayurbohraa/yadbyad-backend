import { Request, Response } from "express";
import { dashboardSummary } from "../controllers/dashboard.controller";
import {
  UserModel,
  ComplainModel,
  ReportModel,
  ResourceModel,
} from "../models";
import SlotRequestModel from "../models/slot-requests.model";

jest.mock("../models", () => ({
  UserModel: { countDocuments: jest.fn() },
  ComplainModel: { countDocuments: jest.fn() },
  ReportModel: { countDocuments: jest.fn() },
  ResourceModel: { countDocuments: jest.fn() },
}));
jest.mock("../models/slot-requests.model", () => ({
  __esModule: true,
  default: { countDocuments: jest.fn() },
}));

const studentId = "507f1f77bcf86cd799439011";
const count = (model: { countDocuments: unknown }) =>
  model.countDocuments as jest.Mock;
let res: Response;
beforeEach(() => {
  for (const model of [
    UserModel,
    ComplainModel,
    ReportModel,
    ResourceModel,
    SlotRequestModel,
  ])
    count(model).mockResolvedValue(3);
  res = {
    locals: { user: { _id: studentId, role: "admin" } },
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;
});

test("administrator dashboard returns real collection counts", async () => {
  await dashboardSummary({} as Request, res);
  expect(res.json).toHaveBeenCalledWith({
    data: {
      students: 3,
      recoveryRequests: 3,
      complaints: 3,
      reports: 3,
      approvedRecoveries: 3,
      resolvedComplaints: 3,
      reviewedReports: 3,
    },
  });
  expect(UserModel.countDocuments).toHaveBeenCalledWith({
    status: "active",
    recoveryRequestStatus: "pending",
  });
});

test.each(["special need student", "part time student"])(
  "%s dashboard limits personal data to the authenticated account",
  async (role) => {
    res.locals.user.role = role;
    await dashboardSummary({} as Request, res);
    expect(UserModel.countDocuments).not.toHaveBeenCalled();
    expect(SlotRequestModel.countDocuments).toHaveBeenCalledWith({
      $or: [{ userId: studentId }, { requesteeId: studentId }],
      status: "accepted",
    });
    expect(ComplainModel.countDocuments).toHaveBeenCalledWith({
      userId: studentId,
      userStatus: "active",
      status: "processing",
    });
    expect(ComplainModel.countDocuments).toHaveBeenCalledWith({
      userId: studentId,
      userStatus: "active",
      status: "completed",
    });
    expect(SlotRequestModel.countDocuments).toHaveBeenCalledWith({
      $or: [{ userId: studentId }, { requesteeId: studentId }],
      status: { $in: ["rejected", "dropped"] },
    });
    if (role === "part time student")
      expect(ReportModel.countDocuments).toHaveBeenCalledWith({
        userId: studentId,
        userStatus: "active",
      });
    else
      expect(ResourceModel.countDocuments).toHaveBeenCalledWith({
        status: "active",
      });
  },
);

test("dashboard failures return a safe error", async () => {
  count(UserModel).mockRejectedValue(new Error("private database details"));
  await dashboardSummary({} as Request, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(JSON.stringify((res.json as jest.Mock).mock.calls)).not.toContain(
    "private database details",
  );
});
