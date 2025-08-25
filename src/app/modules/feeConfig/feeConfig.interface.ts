import { Types } from "mongoose";

export enum ParcelType {
  DOCUMENT = "DOCUMENT",
  PACKAGE = "PACKAGE",
  FRAGILE = "FRAGILE",
  OTHER = "OTHER",
}

export enum FeeType {
  FIXED = "FIXED",
  WEIGHT_BASED = "WEIGHT_BASED",
}

export interface IFeeConfig {
  _id: Types.ObjectId;
  parcelType: ParcelType;
  feeType: FeeType;
  baseFee: number;
  weightRate?: number;
}
