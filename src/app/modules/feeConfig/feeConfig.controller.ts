import httpStatusCodes from "http-status-codes";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { FeeConfigService } from "./feeConfig.service";
import { sendResponse } from "../../utils/sendResponse";

const createFeeConfig = catchAsync(async (req: Request, res: Response) => {
  const result = await FeeConfigService.createFeeConfig(req.body);

  sendResponse(res, {
    statusCode: httpStatusCodes.CREATED,
    success: true,
    message: "Fee Config created",
    data: result,
  });
});

export const getAllFeeConfigs = catchAsync(
  async (req: Request, res: Response) => {
    const result = await FeeConfigService.getAllFeeConfigs(
      req.query as Record<string, string>
    );
    sendResponse(res, {
      statusCode: httpStatusCodes.OK,
      success: true,
      message: "Fee Configs retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const FeeConfigController = {
  createFeeConfig,
  getAllFeeConfigs,
};
