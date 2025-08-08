/* eslint-disable @typescript-eslint/no-unused-vars */
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

/* const updateParcel = async (
  parcelId: string,
  payload: Partial<IParcel>,
  decodedToken: JwtPayload
) => {
  const parcel = await Parcel.findById(parcelId);

  if (decodedToken.role === Role.USER) {
    if (!payload.status) {
      throw new AppError(
        httpStatusCodes.UNAUTHORIZED,
        "You are not authorized to do other assigning works"
      );
    } else {
      if (parcel.status !== DeliveryStatus.PENDING) {
        throw new AppError(
          httpStatusCodes.UNAUTHORIZED,
          "You are not allowed to change the Parcel Status"
        );
      } else {
        if (payload.status !== DeliveryStatus.CANCELLED) {
          throw new AppError(
            httpStatusCodes.UNAUTHORIZED,
            "You are only allowed to Cancel the parcel"
          );
        }
      }
    }
  } else if (
    decodedToken.role === Role.ADMIN ||
    decodedToken.role === Role.SUPER_ADMIN
  ) {
    // Check if parcel is in terminal states
    if (
      parcel.status === DeliveryStatus.CANCELLED ||
      parcel.status === DeliveryStatus.DELIVERED ||
      parcel.status === DeliveryStatus.REJECTED
    ) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "You are not allowed to update a Cancelled, Delivered, or Rejected parcel"
      );
    }

    // If the parcel is still pending
    if (parcel.status === DeliveryStatus.PENDING) {
      if (
        payload.status !== DeliveryStatus.APPROVED &&
        payload.status !== DeliveryStatus.REJECTED
      ) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "You must either approve or reject the parcel request"
        );
      }
    }

    // If status is being set to APPROVED, make sure assignments are done
    if (payload.status === DeliveryStatus.APPROVED) {
      if (
        !parcel.pickupHubId ||
        !parcel.deliveryHubId ||
        !parcel.pickupRiderId ||
        !parcel.deliveryRiderId ||
        !parcel.currentHubId
      ) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Parcel must have pickup hub, delivery hub, pickup rider, delivery rider, and current hub assigned before approval"
        );
      }

      // Fetch pickup rider's user and check availability
      const pickupRiderUser = await User.findById(parcel.pickupRiderId);
      if (
        !pickupRiderUser ||
        pickupRiderUser.riderProfile?.status !==
          RiderAvailabilityStatus.AVAILABLE
      ) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Pickup rider is not available for assignment"
        );
      }

      // Fetch delivery rider's user and check availability
      const deliveryRiderUser = await User.findById(parcel.deliveryRiderId);
      if (
        !deliveryRiderUser ||
        deliveryRiderUser.riderProfile?.status !==
          RiderAvailabilityStatus.AVAILABLE
      ) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Delivery rider is not available for assignment"
        );
      }
    }
  } else if (decodedToken.role === Role.RIDER) {
    if (!payload.status) {
      throw new AppError(
        httpStatusCodes.UNAUTHORIZED,
        "You are not authorized to do other assigning works"
      );
    } else {
      if (parcel.status !== DeliveryStatus.OUT_FOR_DELIVERY) {
        throw new AppError(
          httpStatusCodes.UNAUTHORIZED,
          "You are not allowed to change the Parcel Status"
        );
      } else {
        if (
          payload.status !== DeliveryStatus.DELIVERED ||
          DeliveryStatus.REASSIGNED
        ) {
          throw new AppError(
            httpStatusCodes.UNAUTHORIZED,
            "You are only allowed to update the parcel status as delivered or reassigned"
          );
        }
      }
    }
  }

  const newUpdatedParcel = await Parcel.findByIdAndUpdate(parcelId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedParcel;
}; */

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

const validateUserActions = (parcel: IParcel, payload: Partial<IParcel>) => {
  if (!payload.status || parcel.status !== DeliveryStatus.PENDING) {
    throw new AppError(
      httpStatusCodes.UNAUTHORIZED,
      "You are not allowed to update the Parcel"
    );
  }

  if (payload.status !== DeliveryStatus.CANCELLED) {
    throw new AppError(
      httpStatusCodes.UNAUTHORIZED,
      "You are only allowed to cancel the parcel"
    );
  }
};

const validateAdminActions = async (
  parcel: IParcel,
  payload: Partial<IParcel>
) => {
  if (
    [
      DeliveryStatus.CANCELLED,
      DeliveryStatus.DELIVERED,
      DeliveryStatus.REJECTED,
    ].includes(parcel.status)
  ) {
    throw new AppError(
      httpStatusCodes.BAD_REQUEST,
      "You cannot update a Cancelled, Delivered, or Rejected parcel"
    );
  }

  if (parcel.status === DeliveryStatus.PENDING) {
    if (
      ![DeliveryStatus.APPROVED, DeliveryStatus.REJECTED].includes(
        payload.status!
      )
    ) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "You must approve or reject the parcel first"
      );
    }
  }

  if (payload.status === DeliveryStatus.APPROVED) {
    validateRequiredAssignments(parcel);
    await checkRiderAvailability(parcel.pickupRider, "Pickup");
    await checkRiderAvailability(parcel.deliveryRider, "Delivery");
    await setRidersStatus(
      [parcel.pickupRider, parcel.deliveryRider],
      RiderAvailabilityStatus.ON_DELIVERY
    );
  }
};

const validateRiderActions = async (
  parcel: IParcel,
  payload: Partial<IParcel>,
  decodedToken: JwtPayload
) => {
  if (!payload.status || parcel.status !== DeliveryStatus.OUT_FOR_DELIVERY) {
    throw new AppError(
      httpStatusCodes.UNAUTHORIZED,
      "You cannot update this parcel"
    );
  }

  if (
    ![DeliveryStatus.DELIVERED, DeliveryStatus.REASSIGNED].includes(
      payload.status
    )
  ) {
    throw new AppError(
      httpStatusCodes.UNAUTHORIZED,
      "Invalid parcel status update"
    );
  }

  if (payload.status === DeliveryStatus.DELIVERED) {
    const remainingParcels = await Parcel.countDocuments({
      $or: [
        { pickupRiderId: decodedToken.userId },
        { deliveryRiderId: decodedToken.userId },
      ],
      status: {
        $in: [
          DeliveryStatus.APPROVED,
          DeliveryStatus.IN_TRANSIT,
          DeliveryStatus.OUT_FOR_DELIVERY,
        ],
      },
    });

    if (remainingParcels <= 1) {
      await User.findByIdAndUpdate(decodedToken.userId, {
        "riderProfile.status": RiderAvailabilityStatus.AVAILABLE,
      });
    }
  }
};

const validateRequiredAssignments = (parcel: IParcel) => {
  if (
    !parcel.pickupHub ||
    !parcel.deliveryHub ||
    !parcel.pickupRider ||
    !parcel.deliveryRider ||
    !parcel.currentHub
  ) {
    throw new AppError(
      httpStatusCodes.BAD_REQUEST,
      "Parcel must have all hub and rider assignments before approval"
    );
  }
};

const checkRiderAvailability = async (riderId: string, type: string) => {
  const rider = await User.findById(riderId);
  if (
    !rider ||
    rider.riderProfile?.availabilityStatus !== RiderAvailabilityStatus.AVAILABLE
  ) {
    throw new AppError(
      httpStatusCodes.BAD_REQUEST,
      `${type} rider is not available for assignment`
    );
  }
};

const setRidersStatus = async (
  riderIds: string[],
  status: RiderAvailabilityStatus
) => {
  await User.updateMany(
    { _id: { $in: riderIds } },
    { $set: { "riderProfile.status": status } }
  );
};

const validateParcelAccess = async (
  decodedToken: JwtPayload,
  parcel: IParcel,
  payload: Partial<IParcel>
) => {
  if (decodedToken.role === Role.USER) {
    validateUserActions(parcel, payload);
  } else if ([Role.ADMIN, Role.SUPER_ADMIN].includes(decodedToken.role)) {
    await validateAdminActions(parcel, payload);
  } else if (decodedToken.role === Role.RIDER) {
    await validateRiderActions(parcel, payload, decodedToken);
  }
};

const updateParcel = async (
  parcelId: string,
  payload: Partial<IParcel>,
  decodedToken: JwtPayload
) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) {
    throw new AppError(httpStatusCodes.NOT_FOUND, "Parcel not found");
  }

  await validateParcelAccess(decodedToken, parcel, payload);

  const trackingLogEntry = {
    status: payload.status as DeliveryStatus,
    updatedBy: decodedToken.userId as Types.ObjectId,
  };

  parcel.trackingLogs.push(trackingLogEntry);

  await parcel.save();

  return await Parcel.findByIdAndUpdate(parcelId, payload, {
    new: true,
    runValidators: true,
  });
};

export const ParcelService = {
  createNewParcel,
  getMySentParcels,
  getMyIncomingParcels,
  updateParcel,
  trackParcel,
};
