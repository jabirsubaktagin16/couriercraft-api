import { model, Schema } from "mongoose";
import { FeeType, IFeeConfig } from "./feeConfig.interface";

const feeConfigSchema = new Schema<IFeeConfig>(
  {
    parcelType: {
      type: String,
      required: true,
    },
    feeType: {
      type: String,
      enum: Object.values(FeeType),
      required: true,
      default: FeeType.FIXED,
    },
    baseFee: {
      type: Number,
      required: true,
    },
    weightRate: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const FeeConfig = model<IFeeConfig>("FeeConfig", feeConfigSchema);
