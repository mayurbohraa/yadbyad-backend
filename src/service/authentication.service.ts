import { UserModel } from "../models";
import { User } from "../models/user.model";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from 'mongodb';

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
 * @description This function is used to update users details by using id
 * @param {String} _id
 * @author Kunal Rathod
 * @returns {Promise<User|null>}
 */


export async function findUserByIdAndUpdate(id: string, user: User): Promise<User | null> {
  // Convert the string id to ObjectId
  const objectId = new ObjectId(id);

  // Find the user by _id
  const existingUser = await UserModel.findOne({ _id: objectId });

  if (!existingUser) {
    return null; // User not found
  }

  // Update the user's details
  await UserModel.updateOne({ _id: objectId }, user);

  // Return the updated user
  return await UserModel.findOne({ _id: objectId });
}

/**
 * @description This function is used to reset password details by using email
 * @param {String} email
 * @author Kunal Rathod
 * @returns {Promise<User|null>}
 */
export async function changePasswordByEmail(email: string, newPassword: string): Promise<User|null> {
  // Find the user by email
  const existingUser = await UserModel.findOne({ email });

  if (!existingUser) {
    return null; // User not found
  }

  // Update the user's password
  existingUser.password = newPassword;
  await existingUser.save();

  return existingUser; // Password changed successfully
}


/**
 * @description This function is used to delete users by using id
 * @param {String} _id
 * @author Kunal Rathod
 * @returns {Promise<User|null>}
 */
export async function deleteUserById(id: string): Promise<boolean> {
  // Convert the string id to ObjectId
  const objectId = new ObjectId(id);

  // Find the user by _id and delete them
  const result = await UserModel.deleteOne({ _id: objectId });

  // Check if the deletion was successful
  return result.deletedCount === 1;
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

/**
 * @description This function is used to list all users
 * @author Keshav suman
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<any>}
 */
export async function fetchUsers(page: number, limit: number): Promise<any> {
  return await UserModel.find({})
    .limit(limit)
    .skip((page - 1) * limit);
}
