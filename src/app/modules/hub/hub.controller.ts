import httpStatusCodes from "http-status-codes";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { HubService } from "./hub.service";

const createHub = catchAsync(async (req: Request, res: Response) => {
  const result = await HubService.createHub(req.body);
  sendResponse(res, {
    statusCode: httpStatusCodes.CREATED,
    success: true,
    message: "Hub created",
    data: result,
  });
});

export const getAllHubs = catchAsync(async (req: Request, res: Response) => {
  const result = await HubService.getAllHubs(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: httpStatusCodes.OK,
    success: true,
    message: "Hubs retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateHub = catchAsync(async (req: Request, res: Response) => {
  const result = await HubService.updateHub(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatusCodes.OK,
    success: true,
    message: "Hub updated successfully",
    data: result,
  });
});

const findRidersByHub = catchAsync(async (req: Request, res: Response) => {
  const result = await HubService.findRidersByHub(req.params.id);
  sendResponse(res, {
    statusCode: httpStatusCodes.OK,
    success: true,
    message: "Riders retrieved successfully",
    data: result,
  });
});

export const HubController = {
  createHub,
  getAllHubs,
  updateHub,
  findRidersByHub,
};
