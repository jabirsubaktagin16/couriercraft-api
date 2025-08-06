import { QueryBuilder } from "../../utils/QueryBuilder";
import { feeConfigSearchableFields } from "./feeConfig.constant";
import { IFeeConfig } from "./feeConfig.interface";
import { FeeConfig } from "./feeConfig.model";

const createFeeConfig = async (payload: IFeeConfig) => {
  const existingFeeConfig = await FeeConfig.findOne({
    parcelType: payload.parcelType,
  });

  if (existingFeeConfig) {
    throw new Error("A Fee Config with this type already exists.");
  }
  const feeConfig = await FeeConfig.create(payload);

  return feeConfig;
};

const getAllFeeConfigs = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(FeeConfig.find(), query);

  const feeConfigs = await queryBuilder
    .search(feeConfigSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    feeConfigs.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

export const FeeConfigService = {
  createFeeConfig,
  getAllFeeConfigs,
};
