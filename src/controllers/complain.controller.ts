import { Request, Response } from "express";
import httpStatus from "http-status";
import { Types } from "mongoose";
import { Complain } from "../models/complain.model";
import { ComplainService, SettingsService, AuthenticationService } from "../service";
import { compare } from "bcryptjs";

export async function submitComplain(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { subject, message } =  req.body;
      const Complain = {
      
        subject: subject,
        message: message,
       
      };
      const createdComplain = await ComplainService.createComplain(Complain as Complain);
      await SettingsService.createSettings(createdComplain._id);
      const userData = await AuthenticationService.findUserById(
        userId
      );
      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "Complain is submitted successfully",
        data: {
          complain: createdComplain,
          user: userData,
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
    const { userId } = req.params;
    const complain = await ComplainService.findUserById(
      id
    );
    const userData = await AuthenticationService.findUserById(
      userId
    );
    if (complain) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Complain is fetched successfully",
      data: {
        complain,
        user: userData,
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
    const { userId } = req.params;
    const complain = await ComplainService.findUserByIdAndUpdate(
      id, {...req.body}
    );
    const userData = await AuthenticationService.findUserById(
      userId
    );
    
    if (complain) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Complain is replied successfully",
      data: {
        complain,
        user: userData,
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
    const { userId } = req.params;
    const complain = await ComplainService.deleteUserById(
      id
    );
    const userData = await AuthenticationService.findUserById(
      userId
    );

    if (complain) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Complain is deleted successfully",
      data: {
        complain,
        user: userData,
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