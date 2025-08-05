import { model, Schema } from "mongoose";
import { IHub } from "./hub.interface";

const hubSchema = new Schema<IHub>({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  coveredArea: {
    type: [String],
    required: true,
  },
});

export const Hub = model<IHub>("Hub", hubSchema);
