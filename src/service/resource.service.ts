import { ResourceModel } from "../models";
import { ObjectId } from 'mongodb';
import { Resource } from "../models/resource.model";


/**
 * @description this function creates a library in database
 * @param {Resource} resource
 * @author Kunal Rathod
 * @returns {Promise<Resource>}
 */

export async function createResource(resource: Resource): Promise<Resource> {
  return await ResourceModel.create(resource);
}


/**
 * @description This function is used to find a complain by id
 * @param {String} id
 * @author Kunal Rathod
 * @returns {Promise<Resource|null>}
 */

export async function findResourceById(id: string): Promise<Resource | null> {
  const objectId = new ObjectId(id);
  return await ResourceModel.findOne({ _id: objectId });
  
}


/**
 * @description This function is used to list all complains
 * @author Kunal Rathod
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<any>}
 */
export async function fetchResources(page: number, limit: number): Promise<any> {
  return await ResourceModel.find({})
    .limit(limit)
    .skip((page - 1) * limit);
}

/**
 * @description This function is used to update users details by using id
 * @param {String} _id
 * @author Kunal Rathod
 * @returns {Promise<Resource|null>}
 */


export async function findResourceByIdAndUpdate(id: string, resource: Resource): Promise<Resource | null> {
  // Convert the string id to ObjectId
  const objectId = new ObjectId(id);

  // Find the user by _id
  const existingResource = await ResourceModel.findOne({ _id: objectId });

  if (!existingResource) {
    return null; // User not found
  }

  // Update the user's details
  await ResourceModel.updateOne({ _id: objectId }, resource);

  // Return the updated user
  return await ResourceModel.findOne({ _id: objectId });
  
}


