import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import NotificationModel from "../models/notification.model";
import UserModel, { Role, User } from "../models/user.model";
import { AuthenticationService, NotificationService } from "../service";
import { Notification } from "../models/notification.model";
import {
  createRecoveryCode,
  decryptRecoveryCode,
  encryptRecoveryCode,
  ensureRecoveryCode,
  matchesRecoveryCode,
  passwordFingerprint,
  safeUser,
  validPassword,
} from "../utils/account-security";

const recoveryFields =
  "+recoveryCodeEncrypted +recoveryFailedAttempts +recoveryLockedUntil";
const passwordMessage =
  "Use 8–72 characters with uppercase, lowercase, a number, and a symbol (maximum 72 UTF-8 bytes).";
const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const validEmail = (email: string) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const exact = (value: string) =>
  new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
const activeEmail = (email: string) => ({
  email: exact(email),
  status: "active",
});
const fail = (res: Response) =>
  res
    .status(500)
    .json({ message: "Unable to complete the request. Please try again." });

function isAdmin(res: Response): boolean {
  if (res.locals.user.role === Role.Admin) return true;
  res.status(403).json({ message: "Administrator access is required." });
  return false;
}

function ownsAccount(req: Request, res: Response): boolean {
  if (String(res.locals.user._id) === req.params.id) return true;
  res.status(403).json({ message: "You can only update your own profile." });
  return false;
}

export async function login(req: Request, res: Response) {
  try {
    const username = text(req.body.username);
    const password = req.body.password;
    const user =
      username && typeof password === "string"
        ? await UserModel.findOne({
            username: exact(username),
            status: "active",
          })
        : null;
    if (
      !user ||
      !AuthenticationService.comparePassword(password, user.password)
    ) {
      res.status(401).json({ message: "Incorrect username or password." });
      return;
    }
    await ensureRecoveryCode(String(user._id));
    res.json({
      message: "Signed in successfully.",
      data: {
        user: safeUser(user),
        token: AuthenticationService.generateToken(user),
      },
    });
  } catch {
    fail(res);
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const fullName = text(req.body.fullName);
    const username = text(req.body.username);
    const studentID = text(req.body.studentID);
    const email = text(req.body.email).toLowerCase();
    const mobileNumber = text(req.body.mobileNumber);
    const gender = text(req.body.gender);
    const { role, password } = req.body;
    if (
      !fullName ||
      fullName.length > 100 ||
      !/^[A-Za-z0-9]{4,30}$/.test(username) ||
      !/^\d{4,20}$/.test(studentID) ||
      !validEmail(email) ||
      !/^\+?[\d\s()-]{7,25}$/.test(mobileNumber) ||
      !["male", "female"].includes(gender) ||
      ![Role.PartTime, Role.SpecialNeed].includes(role) ||
      !validPassword(password)
    ) {
      res
        .status(400)
        .json({ message: `Check your account details. ${passwordMessage}` });
      return;
    }
    if (
      await UserModel.exists({
        $or: [
          { email: exact(email) },
          { username: exact(username) },
          { studentID },
        ],
      })
    ) {
      res.status(409).json({
        message: "Email, username, or student ID is already registered.",
      });
      return;
    }
    const user = await UserModel.create({
      fullName,
      username,
      studentID,
      email,
      mobileNumber,
      gender,
      role,
      password: AuthenticationService.hashPassword(password),
      recoveryCodeEncrypted: encryptRecoveryCode(createRecoveryCode()),
    });
    await NotificationService.createNotification({
      message: "New Student Joined",
      userId: user._id,
      notificationType: "newStudentJoined",
    } as Notification).catch(() => undefined);
    res.status(201).json({
      message:
        "Account created. Sign in and save your recovery code from My Profile.",
      data: { user: safeUser(user) },
    });
  } catch {
    fail(res);
  }
}

export async function me(_req: Request, res: Response) {
  res.set("Cache-Control", "no-store");
  res.json({
    data: {
      user: safeUser(res.locals.user),
      token: AuthenticationService.generateToken(res.locals.user),
    },
  });
}

export async function logout(_req: Request, res: Response) {
  try {
    await UserModel.updateOne(
      { _id: res.locals.user._id },
      { $inc: { authVersion: 1 } },
    );
    res.json({ message: "Signed out successfully.", data: { success: true } });
  } catch {
    fail(res);
  }
}

export async function recoveryCode(_req: Request, res: Response) {
  try {
    await ensureRecoveryCode(String(res.locals.user._id));
    const user = await UserModel.findById(res.locals.user._id).select(
      "+recoveryCodeEncrypted",
    );
    if (!user?.recoveryCodeEncrypted) {
      fail(res);
      return;
    }
    res.set("Cache-Control", "no-store");
    res.json({
      data: { recoveryCode: decryptRecoveryCode(user.recoveryCodeEncrypted) },
    });
  } catch {
    fail(res);
  }
}

export async function verifyRecoveryCode(req: Request, res: Response) {
  try {
    const email = text(req.body.email).toLowerCase();
    const code = text(req.body.recoveryCode);
    if (!validEmail(email) || !/^[A-Fa-f0-9\s-]{24,40}$/.test(code)) {
      res
        .status(400)
        .json({ message: "Enter a valid email and recovery code." });
      return;
    }
    const user = await UserModel.findOne(activeEmail(email)).select(
      recoveryFields,
    );
    if (
      user?.recoveryLockedUntil &&
      user.recoveryLockedUntil.getTime() > Date.now()
    ) {
      res
        .status(429)
        .json({ message: "Too many attempts. Try again in 15 minutes." });
      return;
    }
    if (
      !user?.recoveryCodeEncrypted ||
      !matchesRecoveryCode(code, user.recoveryCodeEncrypted)
    ) {
      if (user) {
        // Reset the counter only after a previous lock has expired.
        if (user.recoveryLockedUntil) {
          await UserModel.updateOne(
            { _id: user._id, recoveryLockedUntil: user.recoveryLockedUntil },
            {
              $set: { recoveryFailedAttempts: 0 },
              $unset: { recoveryLockedUntil: 1 },
            },
          );
        }
        const updated = await UserModel.findByIdAndUpdate(
          user._id,
          { $inc: { recoveryFailedAttempts: 1 } },
          { new: true },
        ).select("+recoveryFailedAttempts");
        if ((updated?.recoveryFailedAttempts || 0) >= 5) {
          await UserModel.updateOne(
            { _id: user._id },
            {
              $set: {
                recoveryLockedUntil: new Date(Date.now() + 15 * 60 * 1000),
              },
            },
          );
        }
      }
      res
        .status(400)
        .json({ message: "Email and recovery code do not match." });
      return;
    }
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: { recoveryFailedAttempts: 0 },
        $unset: { recoveryLockedUntil: 1 },
      },
    );
    const resetToken = jwt.sign(
      {
        purpose: "password-reset",
        fingerprint: passwordFingerprint(user.password),
      },
      process.env.JWT_Token!,
      { subject: String(user._id), expiresIn: "10m", algorithm: "HS256" },
    );
    res.set("Cache-Control", "no-store");
    res.json({ message: "Recovery code verified.", data: { resetToken } });
  } catch {
    fail(res);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { resetToken, newPassword } = req.body;
    if (!validPassword(newPassword) || typeof resetToken !== "string") {
      res.status(400).json({ message: passwordMessage });
      return;
    }
    let payload: JwtPayload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_Token!, {
        algorithms: ["HS256"],
      }) as JwtPayload;
      if (payload.purpose !== "password-reset" || !isValidObjectId(payload.sub))
        throw new Error();
    } catch {
      res
        .status(400)
        .json({ message: "Recovery session expired. Verify your code again." });
      return;
    }
    const user = await UserModel.findById(payload.sub);
    if (
      !user ||
      user.status !== "active" ||
      passwordFingerprint(user.password) !== payload.fingerprint
    ) {
      res.status(400).json({
        message: "Recovery session is no longer valid. Verify your code again.",
      });
      return;
    }
    if (AuthenticationService.comparePassword(newPassword, user.password)) {
      res.status(400).json({
        message: "Choose a password different from your current password.",
      });
      return;
    }
    // Compare-and-set makes a reset authorization single-use, including concurrent requests.
    const result = await UserModel.updateOne(
      { _id: user._id, password: user.password, status: "active" },
      {
        $set: {
          password: AuthenticationService.hashPassword(newPassword),
          recoveryFailedAttempts: 0,
        },
        $inc: { authVersion: 1 },
        $unset: { recoveryLockedUntil: 1 },
      },
    );
    if (!result.modifiedCount) {
      res.status(400).json({
        message: "Recovery session is no longer valid. Verify your code again.",
      });
      return;
    }
    res.json({
      message: "Password updated. Sign in with your new password.",
      data: { success: true },
    });
  } catch {
    fail(res);
  }
}

export async function requestRecovery(req: Request, res: Response) {
  try {
    const email = text(req.body.email).toLowerCase();
    if (!validEmail(email)) {
      res.status(400).json({ message: "Enter a valid email address." });
      return;
    }
    // Approval is a dashboard demonstration; it never sends mail or reveals a code.
    await UserModel.updateOne(activeEmail(email), {
      $set: {
        recoveryRequestedAt: new Date(),
        recoveryRequestStatus: "pending",
      },
      $unset: { recoveryApprovedAt: 1 },
    });
    res.json({
      message:
        "If this email is registered, your request has been sent to the administrator. Once accepted, a notification will appear in your dashboard. No email is sent.",
      data: { simulated: true, status: "pending" },
    });
  } catch {
    fail(res);
  }
}

export async function recoveryRequests(_req: Request, res: Response) {
  if (!isAdmin(res)) return;
  try {
    const requests = await UserModel.find({
      status: "active",
      recoveryRequestStatus: { $in: ["pending", "approved"] },
    })
      .select(
        "fullName username email +recoveryRequestedAt +recoveryRequestStatus +recoveryApprovedAt",
      )
      .sort({ recoveryRequestedAt: -1 })
      .limit(100)
      .lean();
    res.json({ data: requests });
  } catch {
    fail(res);
  }
}

export async function approveRecovery(req: Request, res: Response) {
  if (!isAdmin(res)) return;
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid account." });
    return;
  }
  try {
    // Persist acceptance and its private notification together, so a failed
    // notification cannot leave an accepted request without student feedback.
    const accepted = await UserModel.db.transaction(async (session) => {
      const user = await UserModel.findOneAndUpdate(
        {
          _id: req.params.id,
          status: "active",
          recoveryRequestStatus: "pending",
        },
        {
          $set: {
            recoveryRequestStatus: "approved",
            recoveryApprovedAt: new Date(),
          },
        },
        { new: true, session },
      );
      if (!user) return false;
      await NotificationModel.create(
        [
          {
            userId: user._id,
            notificationType: "accountRecoveryAccepted",
            message:
              "Your account recovery request has been accepted by the administrator.",
          },
        ],
        { session },
      );
      return true;
    });
    if (!accepted) {
      res.status(409).json({ message: "This request is no longer pending." });
      return;
    }
    res.json({
      message:
        "Account recovery accepted. A dashboard notification has been sent to the student.",
      data: { accepted: true },
    });
  } catch {
    fail(res);
  }
}

export async function users(req: Request, res: Response) {
  if (!isAdmin(res)) return;
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));
    const data = await UserModel.find({ status: "active" })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ data: data.map(safeUser), message: "Users loaded." });
  } catch {
    fail(res);
  }
}

export async function editUsers(req: Request, res: Response) {
  if (!isAdmin(res)) return;
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid account." });
      return;
    }
    const user = await UserModel.findOne({
      _id: req.params.id,
      status: "active",
    });
    if (!user) {
      res.status(404).json({ message: "Account not found." });
      return;
    }
    res.json({ data: { user: safeUser(user) } });
  } catch {
    fail(res);
  }
}

async function updateProfile(req: Request, res: Response, admin: boolean) {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid account." });
      return;
    }
    const fullName = text(req.body.fullName);
    const username = text(req.body.username);
    const email = text(req.body.email).toLowerCase();
    const mobileNumber = text(req.body.mobileNumber);
    const gender = text(req.body.gender);
    if (
      !fullName ||
      fullName.length > 100 ||
      !/^[A-Za-z0-9]{4,30}$/.test(username) ||
      !validEmail(email) ||
      !/^\+?[\d\s()-]{7,25}$/.test(mobileNumber) ||
      !["male", "female"].includes(gender)
    ) {
      res.status(400).json({
        message: "Check your name, username, email, mobile number, and gender.",
      });
      return;
    }
    if (
      await UserModel.exists({
        _id: { $ne: req.params.id },
        $or: [{ email: exact(email) }, { username: exact(username) }],
      })
    ) {
      res
        .status(409)
        .json({ message: "Email or username is already registered." });
      return;
    }
    const updates: Record<string, unknown> = {
      fullName,
      username,
      email,
      mobileNumber,
      gender,
    };
    if (admin && Object.values(Role).includes(req.body.role))
      updates.role = req.body.role;
    const user = await UserModel.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!user) {
      res.status(404).json({ message: "Account not found." });
      return;
    }
    res.json({
      message: "Profile updated successfully.",
      data: { user: safeUser(user) },
    });
  } catch {
    fail(res);
  }
}

export async function updateUsers(req: Request, res: Response) {
  if (isAdmin(res)) await updateProfile(req, res, true);
}

export async function editProfile(req: Request, res: Response) {
  if (ownsAccount(req, res)) await updateProfile(req, res, false);
}

export async function deleteUsers(req: Request, res: Response) {
  if (!isAdmin(res)) return;
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid account." });
      return;
    }
    if (String(res.locals.user._id) === req.params.id) {
      res
        .status(400)
        .json({ message: "You cannot delete your own administrator account." });
      return;
    }
    const user = await UserModel.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      { $set: { status: "deleted" }, $inc: { authVersion: 1 } },
      { new: true },
    );
    if (!user) {
      res.status(404).json({ message: "Account not found." });
      return;
    }
    res.json({ message: "Account removed.", data: { user: safeUser(user) } });
  } catch {
    fail(res);
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const user: User = res.locals.user;
    const { password, newPassword } = req.body;
    if (typeof password !== "string" || !validPassword(newPassword)) {
      res.status(400).json({ message: passwordMessage });
      return;
    }
    if (!AuthenticationService.comparePassword(password, user.password)) {
      res.status(400).json({ message: "Current password is incorrect." });
      return;
    }
    if (AuthenticationService.comparePassword(newPassword, user.password)) {
      res.status(400).json({
        message: "Choose a password different from your current password.",
      });
      return;
    }
    const updated = await UserModel.findOneAndUpdate(
      { _id: user._id, password: user.password, status: "active" },
      {
        $set: { password: AuthenticationService.hashPassword(newPassword) },
        $inc: { authVersion: 1 },
      },
      { new: true },
    );
    if (!updated) {
      res.status(409).json({ message: "Account changed. Sign in again." });
      return;
    }
    res.json({
      message:
        "Password changed successfully. Other sessions have been signed out.",
      data: {
        user: safeUser(updated),
        token: AuthenticationService.generateToken(updated),
      },
    });
  } catch {
    fail(res);
  }
}
