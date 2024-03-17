import { Request, Response } from "express";
import httpStatus from "http-status";
import { Resource } from "../models/resource.model";
import { ComplainService, SettingsService, ResourceService } from "../service";
import axios from "axios";

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
      
      axios.post(
        "http://localhost:9000/api/v1/notifications/createNotification",
        {
          message: "Resource is created",
          userId1: userId,
          notificationType: "resourcecreated",
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
        }
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

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
     

      axios.post(
        "http://localhost:9000/api/v1/notifications/createNotification",
        {
          message: "Resource is edited",
          userId1: userId,
          notificationType: "resourceedited",
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
        }
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
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
    const { id } = req.params;
    const resource = await ResourceService.findResourceById(
      id
    );
    
    if (resource) {
      resource.status = "deleted";
      resource.save();
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