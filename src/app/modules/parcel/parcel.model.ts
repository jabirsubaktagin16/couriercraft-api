import { model, Schema } from "mongoose";
import { ParcelType } from "../feeConfig/feeConfig.interface";
import { IAddress } from "../user/user.interface";
import { DeliveryPriority, DeliveryStatus, IParcel } from "./parcel.interface";

const addressSchema = new Schema<IAddress>({
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
});

const trackingLogSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(DeliveryStatus),
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    description: String,
  },
  { _id: false }
);

const parcelSchema = new Schema<IParcel>(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(DeliveryPriority),
      required: true,
      default: DeliveryPriority.NORMAL,
    },
    pickupHub: {
      type: Schema.Types.ObjectId,
      ref: "Hub",
    },
    deliveryHub: {
      type: Schema.Types.ObjectId,
      ref: "Hub",
    },
    pickupRider: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
    },
    deliveryRider: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
    },
    pickupAddress: {
      type: addressSchema,
      required: true,
    },
    deliveryAddress: {
      type: addressSchema,
      required: true,
    },
    parcelType: {
      type: Schema.Types.ObjectId,
      ref: "FeeConfig",
      required: true,
      default: ParcelType.PACKAGE,
    },
    weight: {
      type: Number,
    },
    distance: {
      type: Number,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DeliveryStatus),
      required: true,
      default: DeliveryStatus.PENDING,
    },
    currentHub: {
      type: Schema.Types.ObjectId,
      ref: "Hub",
    },
    trackingLogs: [trackingLogSchema],
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Parcel = model<IParcel>("Parcel", parcelSchema);
