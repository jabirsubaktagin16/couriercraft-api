/* eslint-disable @typescript-eslint/no-unused-vars */
import { IUser } from "../modules/user/user.interface";

export const userInfoReturn = (user: IUser) => {
  const { password, ...rest } = user;
  return rest;
};
