import { products } from "../../mocks/productsStubs";
import { APIGatewayProxyEvent } from "aws-lambda";
import { headers } from "../getProductById/getProductById";
import { lambdaHandler as getProductList } from "./getProductList";

describe("getProductList", () => {
  it("should return successful response", async () => {
    const mockEvent = {} as unknown as APIGatewayProxyEvent;

    const result = await getProductList(mockEvent);

    expect(result).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify(products),
      headers,
    });
  });
});
