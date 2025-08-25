/* eslint-disable @typescript-eslint/no-unused-vars */
import { IUser } from "../modules/user/user.interface";
import dayjs from "dayjs";
import crypto from "crypto";

export const userInfoReturn = (user: IUser) => {
  const { password, ...rest } = user;
  return rest;
};

export const generateTrackingId = (): string => {
  const datePart = dayjs().format("YYYYMMDD");

  // Generate a random 6-digit number (zero-padded)
  const randomPart = crypto.randomInt(0, 999999).toString().padStart(6, "0");

  return `TRK-${datePart}-${randomPart}`;
};
