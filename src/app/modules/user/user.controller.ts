/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatusCodes from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);

    sendResponse(res, {
      statusCode: httpStatusCodes.CREATED,
      success: true,
      message: "User created successfully",
      data: user,
    });
  }
);

const addNewAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const address = req.body;
    const verifiedToken = req.user as JwtPayload;
    const result = await UserService.addNewAddress(address, verifiedToken);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Address added successfully",
      data: result,
    });
  }
);

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await UserService.getAllUsers(query as Record<string, string>);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const verifiedToken = req.user as JwtPayload;
    const payload = req.body;

    const user = await UserService.updateUser(userId, payload, verifiedToken);

    sendResponse(res, {
      statusCode: httpStatusCodes.OK,
      success: true,
      message: "User updated successfully",
      data: user,
    });
  }
);

export const UserController = {
  createUser,
  getAllUsers,
  updateUser,
  addNewAddress,
};
