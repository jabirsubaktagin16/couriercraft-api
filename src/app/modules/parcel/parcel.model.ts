import { model, Schema } from "mongoose";
import { DeliveryStatus, IParcel } from "./parcel.interface";

const parcelSchema = new Schema<IParcel>(
  {
    trackingCode: {
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
    rider: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
    },
    pickupAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    deliveryAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    parcelType: {
      type: Schema.Types.ObjectId,
      ref: "FeeConfig",
      required: true,
    },
    weight: {
      type: Number,
      required: true,
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
    hub: {
      type: Schema.Types.ObjectId,
      ref: "Hub",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Parcel = model<IParcel>("Parcel", parcelSchema);
