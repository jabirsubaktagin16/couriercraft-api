/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatusCodes from "http-status-codes";

import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(
          new AppError(httpStatusCodes.INTERNAL_SERVER_ERROR, err.message)
        );
      }

      if (!user) {
        return next(new AppError(401, info.message));
      }

      const userTokens = await createUserTokens(user);

      const { password, ...rest } = user.toObject();

      setAuthCookie(res, userTokens);

      sendResponse(res, {
        statusCode: httpStatusCodes.OK,
        success: true,
        message: "User logged in successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  }
);

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "No refresh token received from cookies"
      );

    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      statusCode: httpStatusCodes.OK,
      success: true,
      message: "New access token generated successfully",
      data: tokenInfo,
    });
  }
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCodes.OK,
      message: "User logged out successfully",
      data: null,
    });
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;

    await AuthServices.resetPassword(
      decodedToken as JwtPayload,
      oldPassword,
      newPassword
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCodes.OK,
      message: "Password reset successfully",
      data: null,
    });
  }
);

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) redirectTo = redirectTo.slice(1);

    const user = req.user;

    if (!user) throw new AppError(httpStatusCodes.NOT_FOUND, "User not found");

    const tokenInfo = createUserTokens(user);

    setAuthCookie(res, tokenInfo);

    /* sendResponse(res, {
      success: true,
      statusCode: httpStatusCodes.OK,
      message: "Password reset successfully",
      data: null,
    }); */
    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
  }
);

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  googleCallbackController,
};
