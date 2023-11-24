import { Request } from "express";
import { ObjectId } from "mongoose";

export default interface ProtectedRequest extends Request {
  userId: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
