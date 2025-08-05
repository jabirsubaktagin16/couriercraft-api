import { Types } from "mongoose";

export interface IHub {
  _id: Types.ObjectId;
  name: string;
  location: string;
  contactNumber: string;
  coveredArea: string[];
}
