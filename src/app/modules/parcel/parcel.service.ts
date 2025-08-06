/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import httpStatusCodes from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import {
  FeeType,
  IFeeConfig,
  ParcelType,
} from "../feeConfig/feeConfig.interface";
import { FeeConfig } from "../feeConfig/feeConfig.model";
import { IAddress } from "../user/user.interface";
import { User } from "../user/user.model";
import { DeliveryPriority, DeliveryStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import { generateTrackingId } from "../../utils/utilFunction";

interface ICreateParcelRequest {
  receiver: Types.ObjectId;
  priority?: DeliveryPriority;
  pickUpAddressId?: Types.ObjectId;
  pickupAddress?: IAddress;
  deliveryAddressId?: Types.ObjectId;
  deliveryAddress?: IAddress;
  parcelType?: ParcelType;
  weight?: number | 0;
  distance?: number;
}

const createNewParcel = async (
  payload: Partial<ICreateParcelRequest>,
  decodedToken: JwtPayload
) => {
  // Validate sender exists
  const sender = await User.findById(decodedToken.userId);
  if (!sender) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Sender does not exist");
  }

  // Validate receiver exists
  const receiver = await User.findById(payload.receiver);
  if (!receiver) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Receiver does not exist");
  }

  // Validate pickup address
  let finalPickupAddress;
  if (payload.pickUpAddressId) {
    const userAddress = sender.address?.find(
      (addr) => addr._id?.toString() === payload.pickUpAddressId?.toString()
    );
    if (!userAddress) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Pickup address not found"
      );
    }
    finalPickupAddress = userAddress;
  } else if (payload.pickupAddress) {
    finalPickupAddress = {
      ...payload.pickupAddress,
      _id: new Types.ObjectId(),
    };
  } else {
    throw new AppError(
      httpStatusCodes.BAD_REQUEST,
      "Pickup address is required"
    );
  }

  // Validate delivery address
  let finalDeliveryAddress;
  if (payload.deliveryAddressId) {
    const receiverAddress = receiver.address?.find(
      (addr) => addr._id?.toString() === payload.deliveryAddressId?.toString()
    );
    if (!receiverAddress) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Delivery address not found"
      );
    }
    finalDeliveryAddress = receiverAddress;
  } else if (payload.deliveryAddress) {
    finalDeliveryAddress = {
      ...payload.deliveryAddress,
      _id: new Types.ObjectId(),
    };
  } else {
    throw new AppError(
      httpStatusCodes.BAD_REQUEST,
      "Delivery address is required"
    );
  }

  const feeCalculationFlag = await FeeConfig.findOne({
    parcelType: payload.parcelType,
  });

  let fee = 0;

  if (!feeCalculationFlag) {
    throw new AppError(
      httpStatusCodes.NOT_FOUND,
      "Fee configuration not found"
    );
  }

  if (feeCalculationFlag.feeType === FeeType.FIXED) {
    fee = feeCalculationFlag.baseFee!;
  } else {
    if (!payload.weight) {
      throw new AppError(httpStatusCodes.BAD_REQUEST, "Weight is required");
    } else {
      if (payload.weight <= 0) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Weight must be greater than 0"
        );
      } else {
        fee =
          feeCalculationFlag.baseFee! +
          payload.weight! * feeCalculationFlag.weightRate!;
      }
    }
  }

  const trackingLogEntry = {
    status: DeliveryStatus.PENDING,
    updatedBy: sender._id,
    description: "Parcel created and waiting for pickup",
  };

  const parcel = Parcel.create({
    trackingId: generateTrackingId(),
    sender: sender._id,
    receiver: receiver._id,
    priority: payload.priority,
    pickupAddress: finalPickupAddress,
    deliveryAddress: finalDeliveryAddress,
    parcelType: feeCalculationFlag._id,
    weight: payload.weight,
    distance: payload.distance,
    deliveryFee: fee,
    trackingLogs: [trackingLogEntry],
  });

  return parcel;
};

export const ParcelService = {
  createNewParcel,
};
