import { model, Schema } from "mongoose";
import {
  AddressLabel,
  IAddress,
  IAuthProvider,
  IRiderProfile,
  IUser,
  RiderAvailabilityStatus,
  Role,
} from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: {
      type: String,
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const addressSchema = new Schema<IAddress>({
  label: {
    type: String,
    enum: Object.values(AddressLabel),
    required: true,
  },
  addressLine: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const riderProfileSchema = new Schema<IRiderProfile>({
  vehicleType: {
    type: String,
  },
  vehicleNumber: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
  assignedHub: {
    type: Schema.Types.ObjectId,
    ref: "Hub",
  },
  availabilityStatus: {
    type: String,
    enum: Object.values(RiderAvailabilityStatus),
    default: RiderAvailabilityStatus.AVAILABLE,
  },
});

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    picture: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
    },
    isActive: {
      type: String,
    },
    isVerified: {
      type: Boolean,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    auths: [authProviderSchema],
    address: [addressSchema],
    riderProfile: riderProfileSchema,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
