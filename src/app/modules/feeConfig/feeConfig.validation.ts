import z from "zod";
import { FeeType, ParcelType } from "./feeConfig.interface";

export const createFeeConfigZodSchema = z.object({
  parcelType: z.enum(Object.values(ParcelType) as [string]),
  feeType: z.enum(Object.values(FeeType) as [string]),
  baseFee: z
    .number({ error: "Base Fee must be number" })
    .min(0, { message: "Base Fee must be at least 0." }),
  weightRate: z
    .number({ error: "Weight Rate must be number" })
    .min(0, { message: "Weight Rate must be at least 0." })
    .optional(),
});

export const updateFeeConfigZodSchema = z.object({
  feeType: z.enum(Object.values(FeeType) as [string]).optional(),
  baseFee: z
    .number({ error: "Base Fee must be number" })
    .min(0, { message: "Base Fee must be at least 0." })
    .optional(),
  weightRate: z
    .number({ error: "Weight Rate must be number" })
    .min(0, { message: "Weight Rate must be at least 0." })
    .optional(),
});
