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
    const { fullName, email, password, mobileNumber, role, username, studentID, gender } = 
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
    res.status(httpStatus.OK).send({
      data: users,
      statusCode: httpStatus.OK,
      message: "Users Data Fetch Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
}

export async function editUsers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await AuthenticationService.findUserById(
      id
    );
   
    if (user && user.status == "active") {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Edit Users details",
      data: {
        user
      },
    });
  }else{
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "User you are finding is deleted",
      
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

export async function updateUsers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await AuthenticationService.findUserByIdAndUpdate(
      id, {...req.body}
    );
    console.log(user);
    if (user) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Users details updated successfully",
      data: {
        user
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

export async function deleteUsers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await AuthenticationService.findUserById(
      id
    );


    if (user) {
      user.status ="deleted";
      user.save();
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Users deleted successfully",
      data: {
        user
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


export async function forgotPassword(req: Request, res: Response) {
 
  try {
    const { email, newPassword } = req.body;
    const passwordChanged = await AuthenticationService.changePasswordByEmail(email, newPassword);

    if (passwordChanged) {
      res.status(httpStatus.OK).send({
        statusCode: httpStatus.OK,
        message: "New password is set",
      });
    } else {
      res.status(httpStatus.BAD_REQUEST).send({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Email doesn't exist or password couldn't be changed",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
}

export async function editProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await AuthenticationService.findUserByIdAndUpdate(
      id, {...req.body}
    );
    console.log(user);
    if (user) {
    res.status(httpStatus.OK).send({
      statusCode: httpStatus.OK,
      message: "Users details is updated successfully",
      data: {
        user
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

