import { IProduct } from "../../types";

function matchProductSchema(obj: any): obj is IProduct {
  const isAllKeysValid =
    "title" in obj &&
    "description" in obj &&
    "price" in obj &&
    "count" in obj;
  const isAllValueTypesValid =
    typeof obj.title === "string" &&
    typeof obj.description === "string" &&
    typeof Number(obj.price) === "number" &&
    typeof Number(obj.count) === "number";

  const isValidValues = obj.price >= 0 && obj.count >= 0;

  return isAllKeysValid && isAllValueTypesValid && isValidValues;
}

export const validateProduct = (data: any) => {

    return matchProductSchema(data);
};
