import { ComplainModel } from "../models";
import { Complain } from "../models/complain.model";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from 'mongodb';


/**
 * @description this function creates a complain in database
 * @param {Complain} complain
 * @author Kunal Rathod
 * @returns {Promise<Complain>}
 */

export async function createComplain(complain: Complain): Promise<Complain> {
  return await ComplainModel.create(complain);
}

/**
 * @description This function is used to generate authenticaton token
 * @param {Complain} complain
 * @author Kunal Rathod
 * @returns {Promise<Complain>}
 */
export function generateToken(complain: Complain): string {
  return jsonwebtoken.sign(complain, process.env.JWT_Token!);
}

/**
 * @description This function is used to find a complain by id
 * @param {String} id
 * @author Kunal Rathod
 * @returns {Promise<Complain|null>}
 */

export async function findComplainById(id: string): Promise<Complain | null> {
  const objectId = new ObjectId(id);
  // return await ComplainModel.findOne({ _id: objectId }).populate({path: "userId",model: "users", select:{
  //   fullName: 1,
  //   email: 2,
  //   mobileNumber: 3,
  //   password: 4,
  //   major: 5,
  //   username:6, 
  //   studentID: 7,
  //   role: 8,
  //   gender: 9,
  //   status:10 
   
  // }});

  return await ComplainModel.findOne({ _id: objectId }).populate({path: "userId",model: "users"});
  
}

/**
 * @description This function is used to update users details by using id
 * @param {String} _id
 * @author Kunal Rathod
 * @returns {Promise<Complain|null>}
 */


export async function findUserByIdAndUpdate(id: string, complain: Complain): Promise<Complain | null> {
  // Convert the string id to ObjectId
  const objectId = new ObjectId(id);

  // Find the user by _id
  const existingComplain = await ComplainModel.findOne({ _id: objectId });

  if (!existingComplain) {
    return null; // User not found
  }

  // Update the user's details
  await ComplainModel.updateOne({ _id: objectId }, complain);

  // Return the updated user
  return await ComplainModel.findOne({ _id: objectId }).populate({path: "userId",model: "users"});
  
}


/**
 * @description This function is used to delete complain by using id
 * @param {String} _id
 * @author Kunal Rathod
 * @returns {Promise<boolean|null>}
 */
export async function deleteComplainById(id: string): Promise<boolean> {
  // Convert the string id to ObjectId
  const objectId = new ObjectId(id);

  // Find the user by _id and delete them
  const result = await ComplainModel.deleteOne({ _id: objectId });

  // Check if the deletion was successful
  return result.deletedCount === 1;
}
