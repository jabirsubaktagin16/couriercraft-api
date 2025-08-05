/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from "bcryptjs";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";

const createUserService = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  //   const existingUser = await User.findOne({ email });

  /* if (existingUser) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "User already exists");
  } */

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email!,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  const { password: pass, ...restInfo } = user.toObject();

  return restInfo;
};

export const UserService = {
  createUserService,
};
