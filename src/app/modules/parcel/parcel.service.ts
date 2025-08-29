/* eslint-disable @typescript-eslint/no-non-null-assertion */
import httpStatusCodes from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { generateTrackingId } from "../../utils/utilFunction";
import { FeeType, ParcelType } from "../feeConfig/feeConfig.interface";
import { FeeConfig } from "../feeConfig/feeConfig.model";
import {
  IAddress,
  RiderAvailabilityStatus,
  Role,
} from "../user/user.interface";
import { User } from "../user/user.model";
import { DeliveryPriority, DeliveryStatus, IParcel } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import { Hub } from "../hub/hub.model";

interface ICreateParcelRequest {
  receiver: Types.ObjectId;
  priority?: DeliveryPriority;
  pickUpAddressId?: Types.ObjectId;
  pickupAddress?: IAddress;
  deliveryAddressId?: Types.ObjectId;
  deliveryAddress?: IAddress;
  parcelType: ParcelType;
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

  if (!sender.phone) {
    throw new AppError(
      httpStatusCodes.BAD_REQUEST,
      "Sender phone number is required. Please add your phone number."
    );
  }

  // Validate receiver exists
  const receiver = await User.findById(payload.receiver);
  if (!receiver) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Receiver does not exist");
  }

  if (!receiver.phone) {
    throw new AppError(
      httpStatusCodes.BAD_REQUEST,
      "Receiver phone number is required. Please ask receiver to add their phone number."
    );
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

const getMySentParcels = async (
  query: Record<string, string>,
  decodedToken: JwtPayload
) => {
  // Validate sender exists
  const sender = await User.findById(decodedToken.userId);
  if (!sender) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Sender does not exist");
  }

  const queryBuilder = new QueryBuilder(
    Parcel.find({ sender: sender._id })
      .populate("sender", "name phone")
      .populate("receiver", "name phone")
      .populate("parcelType", "parcelType"),
    query
  );

  const parcels = await queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([
    parcels.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getMyIncomingParcels = async (
  query: Record<string, string>,
  decodedToken: JwtPayload
) => {
  // Validate receiver exists
  const receiver = await User.findById(decodedToken.userId);
  if (!receiver) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Receiver does not exist");
  }
  const queryBuilder = new QueryBuilder(
    Parcel.find({ receiver: receiver._id })
      .populate("sender", "name phone")
      .populate("receiver", "name phone")
      .populate("parcelType", "parcelType"),
    query
  );

  const parcels = await queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([
    parcels.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const trackParcel = async (trackingId: string, decodedToken: JwtPayload) => {
  const parcel = await Parcel.findOne({ trackingId: trackingId })
    .populate("sender", "name phone")
    .populate("receiver", "name phone");
  if (!parcel)
    throw new AppError(httpStatusCodes.NOT_FOUND, "Parcel not found");

  // If role is User but not in the Receiver or Sender
  if (
    decodedToken.role === Role.USER &&
    decodedToken.userId !== parcel.sender._id.toString() &&
    decodedToken.userId !== parcel.receiver._id.toString()
  ) {
    throw new AppError(httpStatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  // If role is Rider but not in the Pickup or Delivery
  if (
    decodedToken.role === Role.RIDER &&
    (decodedToken.userId !== parcel.pickupRider || parcel.deliveryRider)
  )
    throw new AppError(httpStatusCodes.UNAUTHORIZED, "You are not authorized");

  return parcel;
};

const updateParcel = async (
  parcelId: string,
  payload: Partial<IParcel>,
  decodedToken: JwtPayload
) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel)
    throw new AppError(httpStatusCodes.NOT_FOUND, "Parcel not found");

  const currentStatus = parcel.status;
  const requestedStatus = payload.status;

  // -------------------- STATUS & ROLE BASED PERMISSIONS --------------------
  switch (requestedStatus) {
    // -------------------- USER --------------------
    case DeliveryStatus.CANCELLED:
      if (
        decodedToken.role !== Role.USER ||
        decodedToken.userId.toString() !== parcel.sender.toString()
      ) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only the sender can request cancellation"
        );
      }
      if (currentStatus !== DeliveryStatus.PENDING) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Can only cancel when parcel is still pending"
        );
      }
      parcel.status = DeliveryStatus.CANCELLED;
      break;

    // -------------------- ADMIN --------------------
    case DeliveryStatus.APPROVED:
    case DeliveryStatus.REJECTED:
      if (
        decodedToken.role !== Role.ADMIN &&
        decodedToken.role !== Role.SUPER_ADMIN
      ) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only admin can approve or reject parcels"
        );
      }
      if (currentStatus !== DeliveryStatus.PENDING) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Only pending parcels can be approved or rejected"
        );
      }
      parcel.status = requestedStatus;
      break;

    // -------------------- RIDER (Pickup phase) --------------------
    case DeliveryStatus.PICKED_UP:
      if (decodedToken.role !== Role.RIDER) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can update pickup status"
        );
      }
      if (decodedToken.userId.toString() !== parcel.pickupRider?.toString()) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as pickup rider"
        );
      }
      if (currentStatus !== DeliveryStatus.APPROVED) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Parcel must be approved before pickup"
        );
      }
      parcel.status = DeliveryStatus.PICKED_UP;
      break;

    case DeliveryStatus.IN_TRANSIT:
    case DeliveryStatus.AT_HUB:
      if (decodedToken.role !== Role.RIDER) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can update transit status"
        );
      }
      if (decodedToken.userId.toString() !== parcel.pickupRider?.toString()) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as pickup rider"
        );
      }
      if (currentStatus !== DeliveryStatus.PICKED_UP) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Parcel must be picked up before moving to in-transit or at hub"
        );
      }
      parcel.status = requestedStatus;
      break;

    // -------------------- RIDER (Delivery phase) --------------------
    case DeliveryStatus.OUT_FOR_DELIVERY:
      if (decodedToken.role !== Role.RIDER) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can update delivery status"
        );
      }
      if (decodedToken.userId.toString() !== parcel.deliveryRider?.toString()) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as delivery rider"
        );
      }
      if (currentStatus !== DeliveryStatus.AT_HUB) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Parcel must arrive at hub before going out for delivery"
        );
      }
      parcel.status = DeliveryStatus.OUT_FOR_DELIVERY;
      break;

    case DeliveryStatus.DELIVERED:
      if (decodedToken.role !== Role.RIDER) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can mark as delivered"
        );
      }
      if (decodedToken.userId.toString() !== parcel.deliveryRider?.toString()) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as delivery rider"
        );
      }
      if (currentStatus !== DeliveryStatus.OUT_FOR_DELIVERY) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Parcel must be out for delivery before being marked as delivered"
        );
      }
      parcel.status = DeliveryStatus.DELIVERED;
      break;

    case DeliveryStatus.DELIVERY_FAILED:
    case DeliveryStatus.REASSIGNED:
      if (decodedToken.role !== Role.RIDER) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can update failed/reassigned status"
        );
      }
      if (decodedToken.userId.toString() !== parcel.deliveryRider?.toString()) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as delivery rider"
        );
      }
      if (currentStatus !== DeliveryStatus.OUT_FOR_DELIVERY) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Can only mark as failed/reassigned when out for delivery"
        );
      }
      parcel.status = requestedStatus;
      break;

    default:
      throw new AppError(httpStatusCodes.BAD_REQUEST, "Invalid status update");
  }

  // -------------------- HUB VALIDATIONS --------------------
  if (payload.pickupHub) {
    const hub = await Hub.findById(payload.pickupHub);
    if (!hub) {
      throw new AppError(httpStatusCodes.BAD_REQUEST, "Pickup hub not found");
    }
    if (
      decodedToken.role !== Role.ADMIN &&
      decodedToken.role !== Role.SUPER_ADMIN
    ) {
      throw new AppError(
        httpStatusCodes.FORBIDDEN,
        "You can not assign pickup hub"
      );
    }
    parcel.pickupHub = payload.pickupHub;
  }

  if (payload.deliveryHub) {
    const hub = await Hub.findById(payload.deliveryHub);
    if (!hub) {
      throw new AppError(httpStatusCodes.BAD_REQUEST, "Delivery hub not found");
    }
    if (
      decodedToken.role !== Role.ADMIN &&
      decodedToken.role !== Role.SUPER_ADMIN
    ) {
      throw new AppError(
        httpStatusCodes.FORBIDDEN,
        "You can not assign delivery hub"
      );
    }
    parcel.deliveryHub = payload.deliveryHub;
  }

  // -------------------- RIDER ASSIGNMENTS (Admin only) --------------------
  if (payload.pickupRider) {
    const pickupRiderInfo = await User.findById(payload.pickupRider);
    if (!pickupRiderInfo || pickupRiderInfo.role !== Role.RIDER) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Pickup rider not found or not a rider"
      );
    }
    if (
      pickupRiderInfo.riderProfile?.assignedHub?.toString() !==
      parcel.pickupHub?.toString()
    ) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Pickup rider must be assigned to the parcel's pickup hub"
      );
    }
    if (
      pickupRiderInfo.riderProfile?.availabilityStatus !==
      RiderAvailabilityStatus.AVAILABLE
    ) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Pickup rider is not available"
      );
    }
    parcel.pickupRider = payload.pickupRider;
  }

  if (payload.deliveryRider) {
    const deliveryRider = await User.findById(payload.deliveryRider);
    if (!deliveryRider || deliveryRider.role !== Role.RIDER) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Delivery rider not found or not a rider"
      );
    }
    if (
      deliveryRider.riderProfile?.assignedHub?.toString() !==
      parcel.deliveryHub?.toString()
    ) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Delivery rider must be assigned to the parcel's delivery hub"
      );
    }
    if (
      deliveryRider.riderProfile?.availabilityStatus !==
      RiderAvailabilityStatus.AVAILABLE
    ) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Delivery rider is not available"
      );
    }
    parcel.deliveryRider = payload.deliveryRider;
  }

  // -------------------- TRACKING LOG --------------------
  const trackingLogEntry = {
    status: requestedStatus!,
    updatedBy: decodedToken.userId as Types.ObjectId,
  };

  parcel.trackingLogs.push(trackingLogEntry);

  await parcel.save();

  return parcel;
};

export const ParcelService = {
  createNewParcel,
  getMySentParcels,
  getMyIncomingParcels,
  updateParcel,
  trackParcel,
};
