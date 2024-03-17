import { Request, Response } from "express";
import httpStatus from "http-status";
import { Types } from "mongoose";
import { Complain } from "../models/complain.model";
import { ComplainService, SettingsService } from "../service";
import { compare } from "bcryptjs";
import axios from "axios";


export async function submitComplain(req: Request, res: Response) {
  try {
    const userId = res.get("userId")!;
    const { subject, message } = req.body;
    const Complain = {
      subject: subject,
      message: message,
      userId: userId,
    };

    const createdComplain = await ComplainService.createComplain(
      Complain as Complain
    );
    await SettingsService.createSettings(createdComplain._id);

    axios.post(
        "http://localhost:9000/api/v1/notifications/createNotification",
        {
          message: "Complain is Submitted",
          userId1: userId,
          notificationType: "complainsubmitted",
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
      message: "Complain is submitted successfully",
      data: createdComplain,
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
    const id = res.get("userId")!;
    const { page, limit } = req.query;

    const complains = await ComplainService.fetchComplains(
      id,
      parseInt(page as string),
      parseInt(limit as string)
    );

    const activeComplains = complains.filter(
      (complain: Complain) => complain.userStatus === "active"
    );

    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Complain is fetched successfully",
      data: activeComplains,
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function fetchAllComplain(req: Request, res: Response) {
  try {
    const { page, limit } = req.query;

    const complains = await ComplainService.fetchAllComplain(
      parseInt(page as string),
      parseInt(limit as string)
    );

    const activeComplains = complains.filter(
      (complain: Complain) => complain.userStatus === "active"
    );

    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Complains is fetched successfully",
      data: activeComplains,
    });
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
    const complain = await ComplainService.findUserByIdAndUpdate(id, {
      ...req.body,
    });

    if (complain && complain.userStatus == "active") {
      complain.status = "completed";
      complain.save();

      axios.post(
        "http://localhost:9000/api/v1/notifications/createNotification",
        {
          message: "Complain is replied",
          userId1: complain.userId,
          notificationType: "complainReplied",
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
        message: "Complain is replied successfully",
        data: complain,
      });
    } else {
      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "user or complain is already deleted",
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
    const complain = await ComplainService.findComplainById(id);

    if (complain) {
      complain.userStatus = "deleted";
      complain.save();
      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "Complain is deleted successfully",
        data: complain,
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
