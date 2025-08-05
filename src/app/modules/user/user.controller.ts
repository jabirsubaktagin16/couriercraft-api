/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatusCodes from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUserService(req.body);

    sendResponse(res, {
      statusCode: httpStatusCodes.CREATED,
      success: true,
      message: "User created successfully",
      data: user,
    });
  }
);

export const UserController = {
  createUser,
};
