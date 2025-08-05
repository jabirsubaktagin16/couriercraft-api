import { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

const notFound = (req: Request, res: Response) => {
  res.status(httpStatusCodes.NOT_FOUND).json({
    success: false,
    message: "Route not found",
  });
};

export default notFound;
