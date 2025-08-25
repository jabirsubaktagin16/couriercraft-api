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

const getMySentParcels = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const verifiedToken = req.user as JwtPayload;

  const result = await ParcelService.getMySentParcels(
    query as Record<string, string>,
    verifiedToken
  );

  sendResponse(res, {
    statusCode: httpStatusCodes.OK,
    success: true,
    message: "My Sent Parcels retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyIncomingParcels = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const verifiedToken = req.user as JwtPayload;

  const result = await ParcelService.getMyIncomingParcels(
    query as Record<string, string>,
    verifiedToken
  );

  sendResponse(res, {
    statusCode: httpStatusCodes.OK,
    success: true,
    message: "My Incoming Parcels retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const trackParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const trackingId = req.params.trackingId;

    const verifiedToken = req.user as JwtPayload;

    const parcel = await ParcelService.trackParcel(trackingId, verifiedToken);

    sendResponse(res, {
      statusCode: httpStatusCodes.OK,
      success: true,
      message: "Parcel Tracking Done successfully",
      data: parcel,
    });
  }
);

const updateParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;

    const verifiedToken = req.user as JwtPayload;
    const payload = req.body;

    const parcel = await ParcelService.updateParcel(
      parcelId,
      payload,
      verifiedToken
    );

    sendResponse(res, {
      statusCode: httpStatusCodes.OK,
      success: true,
      message: "Parcel updated successfully",
      data: parcel,
    });
  }
);

export const ParcelController = {
  createNewParcel,
  getMySentParcels,
  getMyIncomingParcels,
  updateParcel,
  trackParcel,
};
