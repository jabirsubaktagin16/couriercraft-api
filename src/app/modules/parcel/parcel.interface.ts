import { Types } from "mongoose";
import { IAddress } from "../user/user.interface";

export enum DeliveryStatus {
  PENDING = "PENDING",
  PICKED_UP = "PICKED_UP",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  IN_TRANSIT = "IN_TRANSIT",
  AT_HUB = "AT_HUB",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERY_FAILED = "DELIVERY_FAILED",
  REASSIGNED = "REASSIGNED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum DeliveryPriority {
  NORMAL = "NORMAL",
  URGENT = "URGENT",
}

export interface ITrackingLog {
  status: DeliveryStatus;
  timestamp?: Date;
  updatedBy?: Types.ObjectId;
  description?: string;
}

export interface IParcel {
  _id: Types.ObjectId;
  trackingId: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  priority: DeliveryPriority;
  pickupHub?: Types.ObjectId;
  deliveryHub?: Types.ObjectId;
  pickupRider?: Types.ObjectId;
  deliveryRider?: Types.ObjectId;
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
  parcelType: Types.ObjectId;
  weight?: number;
  distance?: number;
  deliveryFee: number;
  status: DeliveryStatus;
  currentHub?: Types.ObjectId;
  trackingLogs: ITrackingLog[];
  remarks?: string;
}
