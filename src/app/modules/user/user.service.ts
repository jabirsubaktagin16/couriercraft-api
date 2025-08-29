/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import httpStatusCodes from "http-status-codes";
import bcryptjs from "bcryptjs";
import {
  IAddress,
  IAuthProvider,
  IUser,
  RiderAvailabilityStatus,
  Role,
} from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { Types } from "mongoose";
import { userInfoReturn } from "../../utils/utilFunction";
import { DeliveryStatus } from "../parcel/parcel.interface";
import { Parcel } from "../parcel/parcel.model";

interface AddressPayload {
  address?: IAddress | IAddress[];
}

interface RiderStatus {
  status: "pickup" | "delivery";
}

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  //   const existingUser = await User.findOne({ email });

  /* if (existingUser) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "User already exists");
  } */

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email!,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  const { password: pass, ...restInfo } = user.toObject();

  return restInfo;
};

const addNewAddress = async (
  payload: AddressPayload,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "User does not exist");
  }

  if (!user.address) {
    user.address = [];
  }

  const newAddresses = payload.address;

  if (!newAddresses) {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Address data is required");
  }

  const isDuplicateLabel = (label: string): boolean => {
    return user.address!.some(
      (addr) => addr.label!.toLowerCase() === label.toLowerCase()
    );
  };

  if (Array.isArray(newAddresses)) {
    for (const addr of newAddresses) {
      if (!addr.label) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Address label is required"
        );
      }

      if (isDuplicateLabel(addr.label)) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          `Address label '${addr.label}' already exists. Please update instead.`
        );
      }

      addr._id = addr._id ?? new Types.ObjectId();
      user.address.push(addr);
    }
  } else {
    const addr = newAddresses;
    if (!addr.label) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        "Address label is required"
      );
    }

    if (isDuplicateLabel(addr.label)) {
      throw new AppError(
        httpStatusCodes.BAD_REQUEST,
        `Address label '${addr.label}' already exists. Please update instead.`
      );
    }

    addr._id = addr._id ?? new Types.ObjectId();
    user.address.push(addr);
  }

  await user.save();

  return userInfoReturn(user.toObject());
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find({}, "-password"), query);

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  /**
   * email - can not update
   * name, phone, password address
   * password - re hashing
   *  only admin superadmin - role, isDeleted...
   *
   * promoting to superadmin - superadmin
   */

  if (decodedToken.role === Role.USER || decodedToken.role === Role.RIDER) {
    if (userId !== decodedToken.userId) {
      throw new AppError(
        httpStatusCodes.UNAUTHORIZED,
        "You are not authorized"
      );
    }
  }

  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatusCodes.NOT_FOUND, "User Not Found");
  }

  if (
    decodedToken.role === Role.ADMIN &&
    ifUserExist.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(httpStatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  if (payload.password) {
    const hashedPassword = await bcryptjs.hash(
      payload.password,
      Number(envVars.BCRYPT_SALT_ROUND)
    );
    payload.password = hashedPassword;
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.RIDER) {
      throw new AppError(httpStatusCodes.FORBIDDEN, "You are not authorized");
    } else {
      if (payload.role === Role.RIDER && !payload.riderProfile) {
        throw new AppError(
          httpStatusCodes.BAD_REQUEST,
          "Please add rider profile"
        );
      }
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.RIDER) {
      throw new AppError(httpStatusCodes.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.riderProfile) {
    if (decodedToken.role === Role.USER) {
      throw new AppError(httpStatusCodes.FORBIDDEN, "You are not authorized");
    } else if (decodedToken.role === Role.RIDER) {
      throw new AppError(
        httpStatusCodes.FORBIDDEN,
        "Please contact with admin to update your profile"
      );
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return userInfoReturn(newUpdatedUser!.toObject());
};

const updateRiderStatus = async (
  decodedToken: JwtPayload,
  actionType: RiderStatus
) => {
  // Determine which parcels to update
  let filter = {};
  if (actionType.status === "pickup") {
    filter = {
      pickupRider: decodedToken.userId,
      status: DeliveryStatus.APPROVED,
    };
  } else if (actionType.status === "delivery") {
    filter = {
      deliveryRider: decodedToken.userId,
      status: DeliveryStatus.IN_TRANSIT, // ready for delivery
    };
  } else {
    throw new AppError(httpStatusCodes.BAD_REQUEST, "Invalid bulk action type");
  }

  const parcels = await Parcel.find(filter);
  if (!parcels.length) {
    throw new AppError(
      httpStatusCodes.NOT_FOUND,
      "No parcels found for update"
    );
  }

  // Update parcels and rider status
  let updateStatus;
  if (actionType.status === "pickup") {
    updateStatus = DeliveryStatus.IN_TRANSIT;
  } else if (actionType.status === "delivery") {
    updateStatus = DeliveryStatus.OUT_FOR_DELIVERY;
  }

  await Parcel.updateMany(filter, { $set: { status: updateStatus } });

  // Update rider profile status
  await User.findByIdAndUpdate(decodedToken.userId, {
    $set: {
      "riderProfile.availabilityStatus": RiderAvailabilityStatus.ON_DELIVERY,
    },
  });

  return parcels;
};

export const UserService = {
  createUser,
  getAllUsers,
  updateUser,
  addNewAddress,
  updateRiderStatus,
};
