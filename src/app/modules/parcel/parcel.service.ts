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
  const isAdmin =
    decodedToken.role === Role.ADMIN || decodedToken.role === Role.SUPER_ADMIN;

  // -------------------- HUB VALIDATIONS (Admin-only changes) --------------------
  if (payload.pickupHub) {
    if (!isAdmin) {
      throw new AppError(
        httpStatusCodes.FORBIDDEN,
        "You cannot assign pickup hub"
      );
    }
    const hub = await Hub.findById(payload.pickupHub);
    if (!hub)
      throw new AppError(httpStatusCodes.BAD_REQUEST, "Pickup hub not found");
    parcel.pickupHub = payload.pickupHub;
  }

  if (payload.deliveryHub) {
    if (!isAdmin) {
      throw new AppError(
        httpStatusCodes.FORBIDDEN,
        "You cannot assign delivery hub"
      );
    }
    const hub = await Hub.findById(payload.deliveryHub);
    if (!hub)
      throw new AppError(httpStatusCodes.BAD_REQUEST, "Delivery hub not found");
    parcel.deliveryHub = payload.deliveryHub;
  }

  // -------------------- RIDER ASSIGNMENT (Admin-only) --------------------
  if (payload.pickupRider) {
    if (!isAdmin) {
      throw new AppError(
        httpStatusCodes.FORBIDDEN,
        "You cannot assign pickup rider"
      );
    }
    const pickupRiderInfo = await User.findById(payload.pickupRider);
    if (!pickupRiderInfo || pickupRiderInfo.role !== Role.RIDER) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Pickup rider not found or not a rider"
      );
    }
    // hub match (use most recent hub on parcel—payload or existing)
    const effectivePickupHub = (
      payload.pickupHub ?? parcel.pickupHub
    )?.toString();
    const riderAssignedHub =
      pickupRiderInfo.riderProfile?.assignedHub?.toString();
    if (!riderAssignedHub || riderAssignedHub !== effectivePickupHub) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Pickup rider must be assigned to the parcel's pickup hub"
      );
    }
    // availability
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
    if (!isAdmin) {
      throw new AppError(
        httpStatusCodes.FORBIDDEN,
        "You cannot assign delivery rider"
      );
    }
    const deliveryRider = await User.findById(payload.deliveryRider);
    if (!deliveryRider || deliveryRider.role !== Role.RIDER) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Delivery rider not found or not a rider"
      );
    }
    const effectiveDeliveryHub = (
      payload.deliveryHub ?? parcel.deliveryHub
    )?.toString();
    const riderAssignedHub =
      deliveryRider.riderProfile?.assignedHub?.toString();
    if (!riderAssignedHub || riderAssignedHub !== effectiveDeliveryHub) {
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

  // -------------------- STATUS & ROLE-BASED PERMISSIONS --------------------
  switch (requestedStatus) {
    // Sender-only cancel (when PENDING)
    case DeliveryStatus.CANCELLED: {
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
          "Can only cancel when parcel is pending"
        );
      }
      parcel.status = DeliveryStatus.CANCELLED;
      break;
    }

    // Admin-only approve/reject (when PENDING)
    case DeliveryStatus.APPROVED:
    case DeliveryStatus.REJECTED: {
      if (!isAdmin) {
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only admin/superadmin can approve or reject parcels"
        );
      }
      if (currentStatus !== DeliveryStatus.PENDING) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Only pending parcels can be approved or rejected"
        );
      }

      // EXTRA RULE: APPROVAL REQUIRES HUBS & RIDERS ALREADY SET
      if (requestedStatus === DeliveryStatus.APPROVED) {
        if (
          !parcel.pickupHub ||
          !parcel.deliveryHub ||
          !parcel.pickupRider ||
          !parcel.deliveryRider
        ) {
          throw new AppError(
            httpStatusCodes.BAD_REQUEST,
            "To approve, assign pickup hub, delivery hub, pickup rider, and delivery rider first"
          );
        }

        // Final sanity: re-check hub match & rider availability at approval time
        const [pickupRider, deliveryRider] = await Promise.all([
          User.findById(parcel.pickupRider),
          User.findById(parcel.deliveryRider),
        ]);

        if (
          pickupRider?.riderProfile?.assignedHub?.toString() !==
          parcel.pickupHub?.toString()
        ) {
          throw new AppError(
            httpStatusCodes.BAD_REQUEST,
            "Assigned pickup rider does not belong to the pickup hub"
          );
        }
        if (
          deliveryRider?.riderProfile?.assignedHub?.toString() !==
          parcel.deliveryHub?.toString()
        ) {
          throw new AppError(
            httpStatusCodes.BAD_REQUEST,
            "Assigned delivery rider does not belong to the delivery hub"
          );
        }
        if (
          pickupRider?.riderProfile?.availabilityStatus !==
          RiderAvailabilityStatus.AVAILABLE
        ) {
          throw new AppError(
            httpStatusCodes.BAD_REQUEST,
            "Pickup rider is not available"
          );
        }
        if (
          deliveryRider?.riderProfile?.availabilityStatus !==
          RiderAvailabilityStatus.AVAILABLE
        ) {
          throw new AppError(
            httpStatusCodes.BAD_REQUEST,
            "Delivery rider is not available"
          );
        }

        // On approve, align the current hub to pickup hub (start of journey)
        parcel.currentHub = parcel.pickupHub;
      }

      parcel.status = requestedStatus;
      break;
    }

    // Pickup rider transitions
    case DeliveryStatus.PICKED_UP: {
      if (decodedToken.role !== Role.RIDER)
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can update pickup status"
        );
      if (decodedToken.userId.toString() !== parcel.pickupRider?.toString())
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as pickup rider"
        );
      if (currentStatus !== DeliveryStatus.APPROVED)
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Parcel must be approved before pickup"
        );

      parcel.status = DeliveryStatus.PICKED_UP;
      break;
    }

    case DeliveryStatus.IN_TRANSIT:
    case DeliveryStatus.AT_HUB: {
      if (decodedToken.role !== Role.RIDER)
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can update transit status"
        );
      if (decodedToken.userId.toString() !== parcel.pickupRider?.toString())
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as pickup rider"
        );
      if (currentStatus !== DeliveryStatus.PICKED_UP)
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Parcel must be picked up before moving to in-transit / at-hub"
        );

      // If arriving at hub, set currentHub to deliveryHub
      if (requestedStatus === DeliveryStatus.AT_HUB) {
        parcel.currentHub = parcel.deliveryHub;
      }
      parcel.status = requestedStatus;
      break;
    }

    // Delivery rider transitions
    case DeliveryStatus.OUT_FOR_DELIVERY: {
      if (decodedToken.role !== Role.RIDER)
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can update delivery status"
        );
      if (decodedToken.userId.toString() !== parcel.deliveryRider?.toString())
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as delivery rider"
        );
      if (currentStatus !== DeliveryStatus.AT_HUB)
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Parcel must arrive at delivery hub before going out for delivery"
        );

      // UPDATE RIDER PROFILE STATUS HERE
      const rider = await User.findById(parcel.deliveryRider);
      if (!rider?.riderProfile)
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Rider profile not found"
        );
      rider.riderProfile.availabilityStatus =
        RiderAvailabilityStatus.ON_DELIVERY;

      await rider.save();

      parcel.status = DeliveryStatus.OUT_FOR_DELIVERY;
      break;
    }

    case DeliveryStatus.DELIVERED: {
      if (decodedToken.role !== Role.RIDER)
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can mark as delivered"
        );
      if (decodedToken.userId.toString() !== parcel.deliveryRider?.toString())
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as delivery rider"
        );
      if (currentStatus !== DeliveryStatus.OUT_FOR_DELIVERY)
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Parcel must be out for delivery before being marked delivered"
        );

      // Flip rider availability back to AVAILABLE if no other active O-F-D parcels
      const rider = await User.findById(parcel.deliveryRider);
      if (!rider?.riderProfile)
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Rider profile not found"
        );

      const stillActive = await Parcel.countDocuments({
        deliveryRider: parcel.deliveryRider,
        status: DeliveryStatus.OUT_FOR_DELIVERY,
        _id: { $ne: parcel._id },
      });

      if (stillActive === 0) {
        rider.riderProfile.availabilityStatus =
          RiderAvailabilityStatus.AVAILABLE;
        await rider.save();
      }

      parcel.status = DeliveryStatus.DELIVERED;
      break;
    }

    case DeliveryStatus.DELIVERY_FAILED:
    case DeliveryStatus.REASSIGNED: {
      if (decodedToken.role !== Role.RIDER)
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "Only rider can update failed/reassigned status"
        );
      if (decodedToken.userId.toString() !== parcel.deliveryRider?.toString())
        throw new AppError(
          httpStatusCodes.FORBIDDEN,
          "You are not assigned as delivery rider"
        );
      if (currentStatus !== DeliveryStatus.OUT_FOR_DELIVERY)
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Can only mark failed/reassigned when out for delivery"
        );

      parcel.status = requestedStatus!;
      break;
    }

    default: {
      if (!requestedStatus) {
        break;
      }
      throw new AppError(httpStatusCodes.BAD_REQUEST, "Invalid status update");
    }
  }

  // -------------------- TRACKING LOG --------------------
  if (requestedStatus) {
    parcel.trackingLogs.push({
      status: requestedStatus,
      updatedBy: decodedToken.userId as Types.ObjectId,
    });
  }

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
