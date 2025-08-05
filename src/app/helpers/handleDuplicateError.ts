/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const duplicate = err.message.match(/"([^"]*)"/);

  return {
    statusCode: 400,
    message: `Duplicate field value: ${duplicate?.[1]}. Please use another value!`,
  };
};
