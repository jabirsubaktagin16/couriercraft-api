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
  const parcel = await Parcel.findOne({ trackingId: trackingId });
  if (!parcel)
    throw new AppError(httpStatusCodes.NOT_FOUND, "Parcel not found");

  // If role is User but not in the Receiver or Sender
  if (
    decodedToken.role === Role.USER &&
    decodedToken.userId !== parcel.sender.toString() &&
    decodedToken.userId !== parcel.receiver.toString()
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
  const parcel = await Parcel.findById(parcelId)
    .populate("pickupHub")
    .populate("deliveryHub")
    .populate("pickupRider")
    .populate("deliveryRider");

  if (!parcel)
    throw new AppError(httpStatusCodes.NOT_FOUND, "Parcel not found");

  // ----- Status & role based permission checks -----
  if (payload.status === DeliveryStatus.CANCELLED) {
    if (
      decodedToken.role !== Role.USER ||
      decodedToken.userId.toString() !== parcel.sender.toString()
    ) {
      throw new AppError(
        httpStatusCodes.FORBIDDEN,
        "Only the sender can request cancellation"
      );
    }
    if (parcel.status !== DeliveryStatus.PENDING) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Can only request cancellation when pending"
      );
    }
    parcel.status = DeliveryStatus.CANCELLED;
  } else if (
    [
      DeliveryStatus.CANCELLED,
      DeliveryStatus.REJECTED,
      DeliveryStatus.APPROVED,
    ].includes(payload.status!)
  ) {
    if (decodedToken.role !== Role.ADMIN) {
      throw new AppError(
        httpStatusCodes.FORBIDDEN,
        "Only admin can approve/reject/cancel"
      );
    }
    parcel.status = payload.status!;
  } else if (
    [DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.DELIVERED].includes(
      payload.status!
    )
  ) {
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
    parcel.status = payload.status!;
  } else if (
    [DeliveryStatus.PICKED_UP, DeliveryStatus.AT_HUB].includes(payload.status!)
  ) {
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
    parcel.status = payload.status!;
  } else {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Invalid status update");
  }

  // ---------- pickup rider validation & assignment ----------
  if (payload.pickupRider) {
    const pickupRiderInfo = await User.findById(payload.pickupRider);
    if (!pickupRiderInfo || pickupRiderInfo.role !== Role.RIDER) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Pickup rider not found or not a rider"
      );
    }

    // Hub match: prefer rider.riderProfile.assignedHubId, fallback to other shapes
    const riderAssignedHubId = pickupRiderInfo.riderProfile?.assignedHub;

    const parcelPickupHubId = parcel.pickupHub?.toString?.();

    if (
      !riderAssignedHubId ||
      riderAssignedHubId.toString() !== parcelPickupHubId
    ) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Pickup rider must be assigned to the parcel's pickup hub"
      );
    }

    // Availability check (must be AVAILABLE)
    const riderStatus = pickupRiderInfo.riderProfile?.availabilityStatus;
    if (riderStatus !== RiderAvailabilityStatus.AVAILABLE) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Pickup rider is not available for assignment"
      );
    }

    parcel.pickupRider = payload.pickupRider;
  }

  // ---------- delivery rider validation & assignment ----------
  if (payload.deliveryRider) {
    const deliveryRider = await User.findById(payload.deliveryRider);
    if (!deliveryRider || deliveryRider.role !== Role.RIDER) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Delivery rider not found or not a rider"
      );
    }

    // Hub match: prefer rider.riderProfile.assignedHubId, fallback to other shapes
    const riderAssignedDeliveryHubId = deliveryRider.riderProfile?.assignedHub;

    const parcelDeliveryHubId = parcel.deliveryHub?.toString?.();

    if (
      !riderAssignedDeliveryHubId ||
      riderAssignedDeliveryHubId.toString() !== parcelDeliveryHubId
    ) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Delivery rider must be assigned to the parcel's delivery hub"
      );
    }

    // Availability check (must be AVAILABLE)
    const deliveryRiderStatus = deliveryRider.riderProfile?.availabilityStatus;
    if (deliveryRiderStatus !== RiderAvailabilityStatus.AVAILABLE) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Delivery rider is not available for assignment"
      );
    }

    parcel.deliveryRider = payload.deliveryRider;
  }

  const trackingLogEntry = {
    status: payload.status as DeliveryStatus,
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
