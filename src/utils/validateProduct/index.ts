import { IProduct } from "../../types";

function matchProductSchema(obj: any): obj is IProduct {
  const isAllKeysValid =
    "id" in obj &&
    "title" in obj &&
    "description" in obj &&
    "price" in obj &&
    "count" in obj;
  const isAllValueTypesValid =
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.description === "string" &&
    typeof obj.price === "number" &&
    typeof obj.count === "number";

  return isAllKeysValid && isAllValueTypesValid;
}

export const validateProduct = (data: any) => {

    return matchProductSchema(data);
};
