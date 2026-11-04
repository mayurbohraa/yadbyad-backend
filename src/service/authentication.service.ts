import { UserModel } from "../models";
import { User } from "../models/user.model";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

/**
 * @description This function is used to find a user by id
 * @param {String} id
 * @author Kunal Rathod
 * @returns {Promise<User|null>}
 */

export async function findUserById(id: string): Promise<User | null> {
  const objectId = new ObjectId(id);
  return await UserModel.findOne({ _id: objectId });
}

/**
 * @description this function is used to hash password
 * @param {String} password
 * @author Keshav suman
 * @returns {String}
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password);
}

/**
 * @description this function is used to compare password
 * @param {String} password
 * @param {String} hashpassword
 * @author Keshav suman
 * @returns {Boolean}
 */
export function comparePassword(
  password: string,
  hashpassword: string,
): boolean {
  return bcrypt.compareSync(password, hashpassword);
}

/**
 * @description This function is used to generate authenticaton token
 * @param {User} user
 * @author Keshav suman
 * @returns {String}
 */
export function generateToken(user: User): string {
  return jsonwebtoken.sign(
    {
      _id: String(user._id),
      role: user.role,
      purpose: "access",
      authVersion: user.authVersion || 0,
    },
    process.env.JWT_Token!,
    { algorithm: "HS256" },
  );
}

export async function findUserByStudentSecondId(
  id: string,
): Promise<User | null> {
  return await UserModel.findOne({ studentID: id });
}
