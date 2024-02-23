import { Request, Response } from "express";
import httpStatus from "http-status";
import { User } from "../models/user.model";
import { AuthenticationService, SettingsService } from "../service";

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const user: User | null = await AuthenticationService.findUserByUsername(
      username
    );
    if (user) {
      if (AuthenticationService.comparePassword(password, user.password)) {
        res.status(httpStatus.OK).send({
          statusCode: httpStatus.OK,
          message: "User login successfully",
          data: {
            user,
            token: AuthenticationService.generateToken(user.toObject()),
          },
        });
      } else {
        res.status(httpStatus.BAD_REQUEST).send({
          statusCode: httpStatus.BAD_REQUEST, 
          message: "Password doesn't matched",
        });
      }
    } else {
      res.status(httpStatus.BAD_REQUEST).send({
        statusCode: httpStatus.BAD_REQUEST,
        message: "User doesn't Exists",
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

export async function signup(req: Request, res: Response) {
  try {
    const { fullName, email, password, mobileNumber, role, major, username, studentID, gender } = 
      req.body;
    if (await AuthenticationService.findUserByEmail(email)) {
      res.status(httpStatus.BAD_REQUEST).send({
        statusCode: httpStatus.BAD_REQUEST,
        message: "User already exists",
      });
    } else {
      const user = {
        email,
        fullName: fullName,
        mobileNumber: mobileNumber,
        role: role,
        major,
        username,
        studentID,
        gender,
        password: AuthenticationService.hashPassword(password),
      };
      const createdUser = await AuthenticationService.createUser(user as User);
      await SettingsService.createSettings(createdUser._id);
      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "User created successfully",
        data: {
          user: createdUser,
          token: AuthenticationService.generateToken(createdUser.toObject()),
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

export async function users(req: Request, res: Response) {
  try {
    const { page, limit } = req.query;
    const users = await AuthenticationService.fetchUsers(
      parseInt(page as string),
      parseInt(limit as string)
    );
    res.status(httpStatus.BAD_REQUEST).send({
      data: users,
      statusCode: httpStatus.BAD_REQUEST,
      message: "User doesn't Exists",
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

// export async function editUsers(req: Request, res: Response) {
//   try {
//     const { page, limit } = req.query;
//     const users = await AuthenticationService.fetchUsers(
//       parseInt(page as string),
//       parseInt(limit as string)
//     );
//     res.status(httpStatus.BAD_REQUEST).send({
//       data: users,
//       statusCode: httpStatus.BAD_REQUEST,
//       message: "User doesn't Exists",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: error,
//     });
//   }
// }