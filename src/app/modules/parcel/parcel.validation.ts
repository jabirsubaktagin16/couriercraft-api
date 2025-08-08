import z from "zod";
import { ParcelType } from "../feeConfig/feeConfig.interface";
import { DeliveryPriority, DeliveryStatus } from "./parcel.interface";

const AddressSchema = z.object({
  addressLine: z.string().min(1, "Address line is required"),
  area: z.string().min(1, "Area is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createParcelZodSchema = z.object({
  receiver: z.string({ error: "Receiver must be string" }),
  priority: z.enum(Object.values(DeliveryPriority) as [string]).optional(),
  pickUpAddressId: z
    .string({ error: "Pickup Address ID must be string" })
    .optional(),
  deliveryAddressId: z
    .string({ error: "Delivery Address ID must be string" })
    .optional(),
  pickupAddress: AddressSchema.optional(),
  deliveryAddress: AddressSchema.optional(),
  parcelType: z.enum(Object.values(ParcelType) as [string]).optional(),
  weight: z.number({ error: "Weight must be number" }).optional(),
  distance: z.number({ error: "Distance must be number" }).optional(),
});

export const updateParcelZodSchema = z.object({
  pickupHub: z.string({ error: "Pick Up Hub must be string" }).optional(),
  deliveryHub: z.string({ error: "Delivery Hub must be string" }).optional(),
  pickupRider: z.string({ error: "Pick Up Rider must be string" }).optional(),
  deliveryRider: z
    .string({ error: "Delivery Rider must be string" })
    .optional(),
  status: z.enum(Object.values(DeliveryStatus) as [string]).optional(),
  currentHub: z.string({ error: "Current Hub must be string" }).optional(),
  remarks: z.string({ error: "Remarks must be string" }).optional(),
});
