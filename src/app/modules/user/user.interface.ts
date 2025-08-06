import { Types } from "mongoose";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  RIDER = "RIDER",
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export enum AddressLabel {
  HOME = "HOME",
  OFFICE = "OFFICE",
  OTHER = "OTHER",
}

export enum VehicleType {
  MOTORBIKE = "Motorbike",
  BICYCLE = "Bicycle",
  SCOOTER = "Scooter",
}

export enum RiderAvailabilityStatus {
  AVAILABLE = "Available",
  ON_DELIVERY = "On Delivery",
  INACTIVE = "Inactive",
}

export interface IAuthProvider {
  provider: "google" | "credentials"; // "Google" , "Credential"
  providerId: string;
}

export interface IAddress {
  _id: Types.ObjectId;
  label?: AddressLabel;
  addressLine: string;
  area: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IRiderProfile {
  vehicleType: VehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  assignedHub: Types.ObjectId;
  availabilityStatus: RiderAvailabilityStatus;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;
  role: Role;
  auths: IAuthProvider[];
  address?: IAddress[];
  riderProfile?: IRiderProfile;
}
