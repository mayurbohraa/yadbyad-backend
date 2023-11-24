import { UserModel } from "../models";
import { User } from "../models/user.model";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * @description This function is used to find a user by email
 * @param {String} email
 * @author Keshav suman
 * @returns {Promise<User|null>}
 */

export async function findUserByEmail(email: string): Promise<User | null> {
  return await UserModel.findOne({ email });
}

/**
 * @description This function is used to find a user by username
 * @param {String} username
 * @author Keshav suman
 * @returns {Promise<User|null>}
 */

export async function findUserByUsername(
  username: string
): Promise<User | null> {
  return await UserModel.findOne({ username });
}

/**
 * @description this function creates a user in database
 * @param {User} user
 * @author Keshav suman
 * @returns {Promise<User>}
 */

export async function createUser(user: User): Promise<User> {
  return await UserModel.create(user);
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
  hashpassword: string
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
  return jsonwebtoken.sign(user, process.env.JWT_Token!);
}
