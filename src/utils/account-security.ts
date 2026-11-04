import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "crypto";
import { User } from "../models/user.model";
import UserModel from "../models/user.model";

function encryptionKey(): Buffer {
  const secret = process.env.RECOVERY_CODE_KEY || process.env.JWT_Token;
  if (!secret) throw new Error("Account security key is not configured");
  return createHash("sha256").update(secret).digest();
}

export function createRecoveryCode(): string {
  return randomBytes(12)
    .toString("hex")
    .toUpperCase()
    .match(/.{4}/g)!
    .join("-");
}

// Encryption lets the same account code be revealed again in the profile.
export function encryptRecoveryCode(code: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(code, "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("hex"))
    .join(":");
}

export function decryptRecoveryCode(value: string): string {
  const [iv, tag, encrypted] = value
    .split(":")
    .map((part) => Buffer.from(part, "hex"));
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}

export function matchesRecoveryCode(input: string, encrypted: string): boolean {
  const normalize = (value: string) =>
    value.replace(/[-\s]/g, "").toUpperCase();
  const expected = Buffer.from(normalize(decryptRecoveryCode(encrypted)));
  const actual = Buffer.from(normalize(input));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function passwordFingerprint(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function validPassword(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    value.length <= 72 &&
    Buffer.byteLength(value, "utf8") <= 72 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9\s]/.test(value)
  );
}

export function safeUser(user: User) {
  const {
    _id,
    fullName,
    username,
    studentID,
    email,
    mobileNumber,
    gender,
    role,
    major,
    status,
    isProfileCompleted,
    isEmailVerified,
    isMobileVerified,
    createdAt,
    updatedAt,
  } = user;
  return {
    _id,
    fullName,
    username,
    studentID,
    email,
    mobileNumber,
    gender,
    role,
    major,
    status,
    isProfileCompleted,
    isEmailVerified,
    isMobileVerified,
    createdAt,
    updatedAt,
  };
}

export async function ensureRecoveryCode(id: string): Promise<void> {
  // Atomic initialization also preserves a single code for legacy/demo accounts.
  await UserModel.updateOne(
    {
      _id: id,
      $or: [
        { recoveryCodeEncrypted: { $exists: false } },
        { recoveryCodeEncrypted: null },
      ],
    },
    {
      $set: {
        recoveryCodeEncrypted: encryptRecoveryCode(createRecoveryCode()),
      },
    },
  );
}
