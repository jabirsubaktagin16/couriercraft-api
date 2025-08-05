/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import bcryptjs from "bcryptjs";
import httpStatusCodes from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Email Does not exist");
  }

  const isPasswordCorrect = await bcryptjs.compare(
    password as string,
    user.password as string
  );

  if (!isPasswordCorrect) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Password is incorrect");
  }

  const { accessToken, refreshToken } = createUserTokens(user);

  const { password: pass, ...rest } = user.toObject();

  return {
    accessToken,
    refreshToken,
    user: rest,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const accessToken = await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken,
  };
};

const resetPassword = async (
  decodedToken: JwtPayload,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatched = await bcryptjs.compare(
    oldPassword,
    user!.password as string
  );

  if (!isOldPasswordMatched)
    throw new AppError(
      httpStatusCodes.UNAUTHORIZED,
      "Old Password does not match"
    );

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user!.save();

  return true;
};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  resetPassword,
};
