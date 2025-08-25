import httpStatusCodes from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../errorHelpers/AppError";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;

      if (!accessToken)
        throw new AppError(httpStatusCodes.FORBIDDEN, "Access token not found");

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(httpStatusCodes.FORBIDDEN, "You are not permitted");
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };
