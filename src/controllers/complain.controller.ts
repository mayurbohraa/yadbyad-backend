import { Request, Response } from "express";
import httpStatus from "http-status";
import { Complain } from "../models/complain.model";
import { ComplainService, SettingsService } from "../service";
import { compare } from "bcryptjs";

export async function submitComplain(req: Request, res: Response) {
  try {
    const { subject, message } =  req.body;
      const Complain = {
      
        subject: subject,
        message: message,
       
      };
      const createdComplain = await ComplainService.createComplain(Complain as Complain);
      await SettingsService.createSettings(createdComplain._id);
      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "Complain is submitted successfully",
        data: {
          complain: createdComplain,
          token: ComplainService.generateToken(createdComplain.toObject()),
        },
      });
    
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}


export async function fetchComplain(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const complain = await ComplainService.findUserById(
      id
    );
  
    if (complain) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Complain is fetched successfully",
      data: {
        complain
      },
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

export async function replyComplain(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const complain = await ComplainService.findUserByIdAndUpdate(
      id, {...req.body}
    );
    
    if (complain) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Complain is replied successfully",
      data: {
        complain
      },
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

export async function deleteComplain(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const complain = await ComplainService.deleteUserById(
      id
    );
  
    if (complain) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Complain is deleted successfully",
      data: {
        complain
      },
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