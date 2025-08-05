import { QueryBuilder } from "../../utils/QueryBuilder";
import { hubSearchableFields } from "./hub.constant";
import { IHub } from "./hub.interface";
import { Hub } from "./hub.model";

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

  const tours = await queryBuilder
    .search(hubSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    tours.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
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
};
