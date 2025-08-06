/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatusCodes from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ParcelService } from "./parcel.service";

const createNewParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const verifiedToken = req.user as JwtPayload;
    const payload = req.body;

    const user = await ParcelService.createNewParcel(payload, verifiedToken);

    sendResponse(res, {
      statusCode: httpStatusCodes.CREATED,
      success: true,
      message: "Parcel requested successfully",
      data: user,
    });
  }
);

export const ParcelController = {
  createNewParcel,
};
