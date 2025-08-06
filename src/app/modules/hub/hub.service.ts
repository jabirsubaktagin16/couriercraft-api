import httpStatusCodes from "http-status-codes";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { User } from "../user/user.model";
import { hubSearchableFields } from "./hub.constant";
import { IHub } from "./hub.interface";
import { Hub } from "./hub.model";
import AppError from "../../errorHelpers/AppError";
import { userInfoReturn } from "../../utils/utilFunction";

const createHub = async (payload: IHub) => {
  const existingHub = await Hub.findOne({ name: payload.name });
  if (existingHub) {
    throw new Error("A hub with this name already exists.");
  }
  const hub = await Hub.create(payload);

  return hub;
};

const getAllHubs = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Hub.find(), query);

  const hubs = await queryBuilder
    .search(hubSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    hubs.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const findRidersByHub = async (hubId: string) => {
  const riders = await User.find({
    role: "RIDER",
    "riderProfile.assignedHub": hubId,
  }).lean();

  if (!riders || riders.length === 0) {
    throw new AppError(
      httpStatusCodes.NOT_FOUND,
      "No riders found for this hub"
    );
  }

  const riderList = riders.map((rider) => userInfoReturn(rider));

  return {
    hub: await Hub.findById(hubId),
    riders: riderList,
  };
};

const updateHub = async (id: string, payload: IHub) => {
  const hub = await Hub.findOne({ _id: id });

  if (!hub) {
    throw new Error("Hub not found");
  }

  const updatedHub = await Hub.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updatedHub;
};

export const HubService = {
  createHub,
  getAllHubs,
  updateHub,
  findRidersByHub,
};
