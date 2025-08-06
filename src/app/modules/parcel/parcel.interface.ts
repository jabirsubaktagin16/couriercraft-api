import { Types } from "mongoose";
import { IAddress } from "../user/user.interface";

export enum DeliveryStatus {
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
  REJECTED = "REJECTED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
}

export interface IParcel {
  _id: Types.ObjectId;
  trackingCode: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  rider?: Types.ObjectId;
  pickupAddress: IAddress;
  deliveryAddress: Types.ObjectId | IAddress;
  parcelType: Types.ObjectId;
  weight?: number;
  distance?: number;
  deliveryFee: number;
  status: DeliveryStatus;
  hub?: Types.ObjectId;
}
