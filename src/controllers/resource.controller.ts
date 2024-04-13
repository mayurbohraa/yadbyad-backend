import { Request, Response } from "express";
import httpStatus from "http-status";
import { Resource } from "../models/resource.model";
import { NotificationService, ResourceService } from "../service";
import { Notification } from "../models/notification.model";

export async function createResource(req: Request, res: Response) {
  try {
    const userId  =  res.get("userId")!;
    const { title, description, url } =  req.body;
      const resource = {
      
        title: title,
        description:description, 
        url: url
      };
     
      const createdResource = await ResourceService.createResource(resource as Resource);
      
      NotificationService.createNotification({ 
        message: "New Resource Added by Admin",
          userId: userId.toString(),
          notificationType: "resourcecreated",

         } as  Notification
       );


      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "Resource is submitted successfully",
        data: createdResource
        
      });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}


export async function fetchResources(req: Request, res: Response) {
  try {
   
    const { page, limit } = req.query;

   
 const resources = await ResourceService.fetchResources(
      parseInt(page as string),
      parseInt(limit as string)
    );
    
    const activeResources = resources.filter((resource: Resource) => resource.status === "active");
    
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Resources is fetched successfully",
      data: activeResources
    });
  }
  catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}



export async function editResource(req: Request, res: Response) {
  try {
    const userId  =  res.get("userId")!;
    const { id } = req.params;
    const resource = await ResourceService.findResourceByIdAndUpdate(
      id, {...req.body}
      );      

    if (resource && resource.status == "active") {
     
      NotificationService.createNotification({ 
        message: "Resource is edited",
        userId: userId.toString(),
        notificationType: "resourceedited",

         } as  Notification
       );
    
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Resource is edited successfully",
      data:  resource
    
    });
  }
  else{
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "user or resource is already deleted",
     
    });
  }
  }
   catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function deleteResource(req: Request, res: Response) {
  try {
    const userId  =  res.get("userId")!;
    const { id } = req.params;
    const resource = await ResourceService.findResourceById(
      id
    );
    
    if (resource) {
      resource.status = "deleted";
      resource.save();

      NotificationService.createNotification({ 
        message: "Resource Deleted by Admin",
        userId: userId.toString(),
        notificationType: "resourcedeleted",

         } as  Notification
       );
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Resource is deleted successfully",
      data: resource
    });
  }
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}