import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import moment from "moment";
import * as reports from "../controllers/report.controller";
import { storeReportFile } from "../service/report-file.service";
import UserModel, { Role } from "../models/user.model";
import NotificationModel from "../models/notification.model";
import * as controller from "../controllers/authentication.controller";
import * as notifications from "../controllers/notification.controller";
import verify from "../middlewares/jwtAuth";
import {
  AuthenticationService,
  NotificationService,
  ReportService,
} from "../service";
import {
  createRecoveryCode,
  decryptRecoveryCode,
  encryptRecoveryCode,
  matchesRecoveryCode,
  passwordFingerprint,
  validPassword,
} from "../utils/account-security";

jest.mock("../service/report-file.service", () => ({
  storeReportFile: jest.fn(),
  reportFiles: jest.fn(),
}));
jest.mock("../models/user.model", () => ({
  __esModule: true,
  Role: {
    Admin: "admin",
    PartTime: "part time student",
    SpecialNeed: "special need student",
  },
  default: {
    findOne: jest.fn(),
    findById: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    db: { transaction: jest.fn() },
  },
}));
jest.mock("../models/notification.model", () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));
jest.mock("../service", () => ({
  AuthenticationService: {
    hashPassword: (value: string) => require("bcryptjs").hashSync(value, 4),
    comparePassword: (value: string, hash: string) =>
      require("bcryptjs").compareSync(value, hash),
    generateToken: jest.fn(() => "replacement-access-token"),
    findUserById: jest.fn(),
  },
  NotificationService: {
    createNotification: jest.fn(() => Promise.resolve({})),
    fetchAllNotifications: jest.fn(),
  },
  ReportService: { findReportSlotById: jest.fn(), createReport: jest.fn() },
}));

const models = UserModel as unknown as Record<string, jest.Mock>;
const id = "507f1f77bcf86cd799439011";
let req: Request;
let res: Response;
let user: any;
const selected = (value: unknown) => ({
  select: jest.fn().mockResolvedValue(value),
});

beforeEach(() => {
  process.env.JWT_Token = "unit-test-key-only";
  process.env.RECOVERY_CODE_KEY = "unit-test-encryption-key-only";
  user = {
    _id: id,
    fullName: "Demo Student",
    username: "demo123",
    studentID: "123456789",
    email: "demo@example.test",
    mobileNumber: "+97412345678",
    gender: "female",
    role: Role.PartTime,
    status: "active",
    password: bcrypt.hashSync("Student@123", 4),
    authVersion: 0,
    recoveryCodeEncrypted: encryptRecoveryCode("ABCD-1234-ABCD-1234-ABCD-1234"),
    recoveryFailedAttempts: 0,
  };
  req = {
    body: {},
    params: { id },
    query: {},
    headers: {},
  } as unknown as Request;
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnValue(id),
    locals: { user },
  } as unknown as Response;
  models.updateOne.mockResolvedValue({ modifiedCount: 1 });
  (AuthenticationService.generateToken as jest.Mock).mockReturnValue(
    "replacement-access-token",
  );
  (NotificationService.createNotification as jest.Mock).mockResolvedValue({});
  (UserModel.db.transaction as jest.Mock).mockImplementation((callback) =>
    callback({}),
  );
  (NotificationModel.create as jest.Mock).mockResolvedValue([{}]);
  (NotificationService.fetchAllNotifications as jest.Mock).mockResolvedValue(
    [],
  );
  (AuthenticationService.findUserById as jest.Mock).mockResolvedValue(user);
});

function status() {
  return (res.status as jest.Mock).mock.calls[0]?.[0] || 200;
}
function response() {
  return (res.json as jest.Mock).mock.calls[0]?.[0];
}

describe("account security primitives", () => {
  test("creates unpredictable account codes and decrypts them without storing plaintext", () => {
    const code = createRecoveryCode();
    expect(code).toMatch(/^[A-F0-9]{4}(-[A-F0-9]{4}){5}$/);
    expect(createRecoveryCode()).not.toBe(code);
    const encrypted = encryptRecoveryCode(code);
    expect(encrypted).not.toContain(code);
    expect(decryptRecoveryCode(encrypted)).toBe(code);
    expect(
      matchesRecoveryCode(code.toLowerCase().replace(/-/g, " "), encrypted),
    ).toBe(true);
    expect(matchesRecoveryCode("0000", encrypted)).toBe(false);
    const tampered = `${encrypted[0] === "0" ? "1" : "0"}${encrypted.slice(1)}`;
    expect(() => decryptRecoveryCode(tampered)).toThrow();
  });
  test("validates password complexity and bcrypt byte limits", () => {
    expect(validPassword("NewStudent@123")).toBe(true);
    for (const value of [
      null,
      "short",
      "alllowercase1!",
      "ALLUPPERCASE1!",
      "NoNumbers!",
      "NoSymbols123",
      `Aa1!${"é".repeat(35)}`,
    ]) {
      expect(validPassword(value)).toBe(false);
    }
  });
});

describe("signup and login", () => {
  const signup = {
    fullName: "Demo Student",
    username: "demo123",
    studentID: "123456789",
    email: "demo@example.test",
    mobileNumber: "+97412345678",
    gender: "female",
    role: Role.PartTime,
    password: "Student@123",
  };
  test("public signup rejects an administrator role", async () => {
    req.body = { ...signup, role: Role.Admin };
    await controller.signup(req, res);
    expect(status()).toBe(400);
    expect(models.create).not.toHaveBeenCalled();
  });
  test("signup creates a code once and returns no password or recovery secret", async () => {
    req.body = signup;
    models.exists.mockResolvedValue(null);
    models.create.mockResolvedValue(user);
    await controller.signup(req, res);
    expect(status()).toBe(201);
    const created = models.create.mock.calls[0][0];
    expect(bcrypt.compareSync(signup.password, created.password)).toBe(true);
    expect(decryptRecoveryCode(created.recoveryCodeEncrypted)).toMatch(
      /^[A-F0-9-]{29}$/,
    );
    expect(response().data.user.password).toBeUndefined();
    expect(response().data.user.recoveryCodeEncrypted).toBeUndefined();
  });
  test("duplicate signup is rejected", async () => {
    req.body = signup;
    models.exists.mockResolvedValue({ _id: id });
    await controller.signup(req, res);
    expect(status()).toBe(409);
    expect(models.create).not.toHaveBeenCalled();
  });
  test("wrong login credentials return a generic error", async () => {
    req.body = { username: user.username, password: "Wrong@123" };
    models.findOne.mockResolvedValue(user);
    await controller.login(req, res);
    expect(status()).toBe(401);
    expect(models.updateOne).not.toHaveBeenCalled();
  });
  test("login initializes legacy account recovery atomically and returns safe fields", async () => {
    req.body = { username: user.username, password: "Student@123" };
    models.findOne.mockResolvedValue(user);
    await controller.login(req, res);
    expect(status()).toBe(200);
    expect(models.updateOne.mock.calls[0][0].$or).toBeDefined();
    expect(response().data.user.password).toBeUndefined();
    expect(response().data.token).toBe("replacement-access-token");
  });
});

describe("recovery verification and reset", () => {
  test("correct code issues a short reset authorization without exposing the code", async () => {
    req.body = { email: user.email, recoveryCode: "abcd1234abcd1234abcd1234" };
    models.findOne.mockReturnValue(selected(user));
    await controller.verifyRecoveryCode(req, res);
    const token = jwt.verify(
      response().data.resetToken,
      process.env.JWT_Token!,
    ) as jwt.JwtPayload;
    expect(token.purpose).toBe("password-reset");
    expect(token.sub).toBe(id);
    expect(token.exp! - token.iat!).toBe(600);
    expect(token.fingerprint).toBe(passwordFingerprint(user.password));
    expect(JSON.stringify(response())).not.toContain(
      user.recoveryCodeEncrypted,
    );
  });
  test("wrong codes count failures and lock after five attempts", async () => {
    req.body = {
      email: user.email,
      recoveryCode: "0000-0000-0000-0000-0000-0000",
    };
    models.findOne.mockReturnValue(selected(user));
    models.findByIdAndUpdate.mockReturnValue(
      selected({ recoveryFailedAttempts: 5 }),
    );
    await controller.verifyRecoveryCode(req, res);
    expect(status()).toBe(400);
    expect(models.updateOne).toHaveBeenCalledWith(
      { _id: id },
      { $set: { recoveryLockedUntil: expect.any(Date) } },
    );
  });
  test("locked accounts cannot verify even with the correct code", async () => {
    user.recoveryLockedUntil = new Date(Date.now() + 60000);
    req.body = {
      email: user.email,
      recoveryCode: "ABCD-1234-ABCD-1234-ABCD-1234",
    };
    models.findOne.mockReturnValue(selected(user));
    await controller.verifyRecoveryCode(req, res);
    expect(status()).toBe(429);
  });
  test("the old email-only reset is rejected", async () => {
    req.body = { email: user.email, newPassword: "NewStudent@123" };
    await controller.forgotPassword(req, res);
    expect(status()).toBe(400);
    expect(models.updateOne).not.toHaveBeenCalled();
  });
  test.each(["invalid", "wrong-purpose", "expired"])(
    "rejects a %s reset authorization",
    async (kind) => {
      const resetToken =
        kind === "invalid"
          ? "invalid"
          : jwt.sign(
              {
                purpose: kind === "wrong-purpose" ? "access" : "password-reset",
              },
              process.env.JWT_Token!,
              { subject: id, expiresIn: kind === "expired" ? -1 : 600 },
            );
      req.body = { resetToken, newPassword: "NewStudent@123" };
      await controller.forgotPassword(req, res);
      expect(status()).toBe(400);
      expect(models.updateOne).not.toHaveBeenCalled();
    },
  );
  test("a reset changes the password, revokes sessions, and cannot be replayed", async () => {
    const resetToken = jwt.sign(
      {
        purpose: "password-reset",
        fingerprint: passwordFingerprint(user.password),
      },
      process.env.JWT_Token!,
      { subject: id, expiresIn: 600 },
    );
    req.body = { resetToken, newPassword: "NewStudent@123" };
    models.findById.mockResolvedValue(user);
    await controller.forgotPassword(req, res);
    expect(status()).toBe(200);
    const update = models.updateOne.mock.calls[0][1];
    expect(bcrypt.compareSync(req.body.newPassword, update.$set.password)).toBe(
      true,
    );
    expect(update.$inc.authVersion).toBe(1);
    user.password = update.$set.password;
    (res.json as jest.Mock).mockClear();
    (res.status as jest.Mock).mockClear();
    models.updateOne.mockClear();
    await controller.forgotPassword(req, res);
    expect(status()).toBe(400);
    expect(models.updateOne).not.toHaveBeenCalled();
  });
  test("a concurrent reset cannot reuse an already consumed authorization", async () => {
    req.body = {
      resetToken: jwt.sign(
        {
          purpose: "password-reset",
          fingerprint: passwordFingerprint(user.password),
        },
        process.env.JWT_Token!,
        { subject: id, expiresIn: 600 },
      ),
      newPassword: "NewStudent@123",
    };
    models.findById.mockResolvedValue(user);
    models.updateOne.mockResolvedValue({ modifiedCount: 0 });
    await controller.forgotPassword(req, res);
    expect(status()).toBe(400);
  });
  test("recovery requests are explicitly simulated and do not disclose account existence", async () => {
    req.body = { email: "missing@example.test" };
    await controller.requestRecovery(req, res);
    expect(status()).toBe(200);
    expect(response().data).toEqual({ simulated: true, status: "pending" });
    expect(models.updateOne.mock.calls[0][1].$set.recoveryRequestStatus).toBe(
      "pending",
    );
    expect(NotificationModel.create).not.toHaveBeenCalled();
    expect(response().message).toContain("No email is sent");
    expect(JSON.stringify(response())).not.toContain("ABCD");
  });
});

describe("profile, password, and access control", () => {
  test("students cannot update another account", async () => {
    req.params.id = "507f1f77bcf86cd799439012";
    await controller.editProfile(req, res);
    expect(status()).toBe(403);
    expect(models.findOneAndUpdate).not.toHaveBeenCalled();
  });
  test("profile updates ignore attempts to change role, student ID, password, or recovery code", async () => {
    req.body = {
      ...user,
      role: Role.Admin,
      password: "attacker",
      studentID: "99999999",
      recoveryCodeEncrypted: "attacker",
    };
    models.exists.mockResolvedValue(null);
    models.findOneAndUpdate.mockResolvedValue(user);
    await controller.editProfile(req, res);
    expect(status()).toBe(200);
    const update = models.findOneAndUpdate.mock.calls[0][1].$set;
    expect(Object.keys(update).sort()).toEqual(
      ["fullName", "username", "email", "mobileNumber", "gender"].sort(),
    );
  });
  test("students cannot list all user accounts", async () => {
    await controller.users(req, res);
    expect(status()).toBe(403);
    expect(models.find).not.toHaveBeenCalled();
  });
  test("changing passwords requires the current password", async () => {
    req.body = { password: "Wrong@123", newPassword: "NewStudent@123" };
    await controller.changePassword(req, res);
    expect(status()).toBe(400);
    expect(models.findOneAndUpdate).not.toHaveBeenCalled();
  });
  test("password change returns a replacement session without changing the recovery code", async () => {
    req.body = { password: "Student@123", newPassword: "NewStudent@123" };
    models.findOneAndUpdate.mockResolvedValue({ ...user, authVersion: 1 });
    await controller.changePassword(req, res);
    expect(status()).toBe(200);
    expect(
      models.findOneAndUpdate.mock.calls[0][1].$set.recoveryCodeEncrypted,
    ).toBeUndefined();
    expect(response().data.token).toBe("replacement-access-token");
    expect(response().data.user.password).toBeUndefined();
  });
  test("authenticated profile reveal returns the stored code with caching disabled", async () => {
    models.findById.mockReturnValue(selected(user));
    await controller.recoveryCode(req, res);
    expect(response().data.recoveryCode).toBe("ABCD-1234-ABCD-1234-ABCD-1234");
    expect(res.set).toHaveBeenCalledWith("Cache-Control", "no-store");
  });
  test("malformed access tokens always receive an answer", async () => {
    req.headers.authorization = "Bearer invalid";
    const next = jest.fn();
    await verify(req, res, next);
    expect(status()).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
  test("reset tokens cannot authorize protected endpoints", async () => {
    req.headers.authorization = `Bearer ${jwt.sign(
      { purpose: "password-reset" },
      process.env.JWT_Token!,
    )}`;
    await verify(req, res, jest.fn());
    expect(status()).toBe(401);
  });
  test("password changes invalidate older access sessions", async () => {
    req.headers.authorization = `Bearer ${jwt.sign(
      { _id: id, purpose: "access", authVersion: 0 },
      process.env.JWT_Token!,
    )}`;
    models.findById.mockResolvedValue({ ...user, authVersion: 1 });
    const next = jest.fn();
    await verify(req, res, next);
    expect(status()).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
  test("valid sessions use the current database role", async () => {
    req.headers.authorization = `Bearer ${jwt.sign(
      { _id: id, purpose: "access", authVersion: 0, role: Role.Admin },
      process.env.JWT_Token!,
    )}`;
    models.findById.mockResolvedValue(user);
    const next = jest.fn();
    await verify(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.set).toHaveBeenCalledWith("role", Role.PartTime);
  });
});

describe("administrator recovery approval", () => {
  test("students cannot list or approve recovery requests", async () => {
    await controller.recoveryRequests(req, res);
    expect(status()).toBe(403);
    (res.status as jest.Mock).mockClear();
    await controller.approveRecovery(req, res);
    expect(status()).toBe(403);
    expect(UserModel.db.transaction).not.toHaveBeenCalled();
  });
  test("approval creates one notification addressed only to the requesting account", async () => {
    res.locals.user = { ...user, role: Role.Admin };
    models.findOneAndUpdate.mockResolvedValue(user);
    await controller.approveRecovery(req, res);
    expect(status()).toBe(200);
    expect(models.findOneAndUpdate.mock.calls[0][0]).toEqual({
      _id: id,
      status: "active",
      recoveryRequestStatus: "pending",
    });
    expect(NotificationModel.create).toHaveBeenCalledWith(
      [
        {
          userId: id,
          notificationType: "accountRecoveryAccepted",
          message:
            "Your account recovery request has been accepted by the administrator.",
        },
      ],
      { session: expect.anything() },
    );
    expect(JSON.stringify(response())).not.toContain(
      user.recoveryCodeEncrypted,
    );
  });
  test("repeated approvals do not send duplicate notifications", async () => {
    res.locals.user = { ...user, role: Role.Admin };
    models.findOneAndUpdate.mockResolvedValue(null);
    await controller.approveRecovery(req, res);
    expect(status()).toBe(409);
    expect(NotificationModel.create).not.toHaveBeenCalled();
  });
  test("notification errors are not reported as successful approval", async () => {
    res.locals.user = { ...user, role: Role.Admin };
    models.findOneAndUpdate.mockResolvedValue(user);
    (NotificationModel.create as jest.Mock).mockRejectedValue(
      new Error("write failed"),
    );
    await controller.approveRecovery(req, res);
    expect(status()).toBe(500);
  });
  test("acceptance notifications cannot be forged using the public notification endpoint", async () => {
    req.body = { notificationType: "accountRecoveryAccepted", userId: id };
    await notifications.createNotification(req, res);
    expect(status()).toBe(403);
    expect(NotificationService.createNotification).not.toHaveBeenCalled();
  });
  test("notification queries use the authenticated role and restrict acceptance to its recipient", async () => {
    req.query = { role: "admin" };
    await notifications.fetchNotification(req, res);
    expect(status()).toBe(200);
    const filter = (NotificationService.fetchAllNotifications as jest.Mock).mock
      .calls[0][0];
    expect(filter.$and).toEqual([
      {
        $or: [
          { notificationType: { $ne: "accountRecoveryAccepted" } },
          { userId: id },
        ],
      },
    ]);
    expect(filter.$or).toContainEqual({
      notificationType: "reportSlotCreated",
    });
  });
});

describe("report upload regressions", () => {
  test("missing files and malformed report descriptions return a validation error", async () => {
    req.body = { filename: "Report", fileDescription: "Description" };
    await reports.submitReport(req, res);
    expect(status()).toBe(400);
    expect(ReportService.findReportSlotById).not.toHaveBeenCalled();
    req.file = { filename: "report.pdf" } as Express.Multer.File;
    req.body.fileDescription = {};
    (res.status as jest.Mock).mockClear();
    await reports.submitReport(req, res);
    expect(status()).toBe(400);
  });
  test("submitted reports reference a GridFS file and protected download route", async () => {
    req.body = { filename: "Report", fileDescription: "Description" };
    req.params.slotId = id;
    req.file = {
      originalname: "sample.pdf",
      buffer: Buffer.from("sample"),
    } as Express.Multer.File;
    (ReportService.findReportSlotById as jest.Mock).mockResolvedValue({
      startDate: moment().subtract(1, "hour").format("DD-MM-YY: hh:mma"),
      endDate: moment().add(1, "hour").format("DD-MM-YY: hh:mma"),
    });
    (ReportService.createReport as jest.Mock).mockResolvedValue({ _id: id });
    (storeReportFile as jest.Mock).mockResolvedValue(id);
    await reports.submitReport(req, res);
    expect(status()).toBe(200);
    expect(ReportService.createReport).toHaveBeenCalledWith(
      expect.objectContaining({
        fileId: id,
        fileUrl: expect.stringMatching(/^reports\/[a-f0-9]{24}\/file$/),
      }),
    );
  });
});

describe("persistent demo sessions", () => {
  test("new access sessions have no automatic expiry", () => {
    const service = jest.requireActual("../service/authentication.service");
    const payload = jwt.verify(service.generateToken(user), process.env.JWT_Token!) as jwt.JwtPayload;
    expect(payload.purpose).toBe("access");
    expect(payload.exp).toBeUndefined();
  });
  test("access sessions do not end because of the old token expiry", async () => {
    req.headers.authorization = `Bearer ${jwt.sign(
      { _id: id, purpose: "access", authVersion: 0 },
      process.env.JWT_Token!,
      { expiresIn: -1 },
    )}`;
    models.findById.mockResolvedValue(user);
    const next = jest.fn();
    await verify(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
  test("explicit logout revokes account sessions on the server", async () => {
    await controller.logout(req, res);
    expect(status()).toBe(200);
    expect(models.updateOne).toHaveBeenCalledWith(
      { _id: id },
      { $inc: { authVersion: 1 } },
    );
  });
});
