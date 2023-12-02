import { products } from "../../mocks/productsStubs";
import { APIGatewayProxyEvent } from "aws-lambda";
import { lambdaHandler as getProductById, headers } from "./getProductById";
import * as getAllDataFromDB from "../../utils/getAllDataFromDB";

const mockProduct = products[0];

describe("getProductById", () => {
  beforeEach(() => {
    jest
      .spyOn(getAllDataFromDB, "getAllDataFromDB")
      .mockResolvedValue(products);
  });
  it("should return successful response if a product exists", async () => {
    const mockEvent = {
      pathParameters: {
        productId: mockProduct.id,
      },
    } as unknown as APIGatewayProxyEvent;

    const result = await getProductById(mockEvent);

    expect(result).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify(mockProduct),
      headers,
    });
  });

  it("should return 404 status code if a product does not exist", async () => {
    const mockEvent = {
      pathParameters: {
        productId: "testId",
      },
    } as unknown as APIGatewayProxyEvent;

    const result = await getProductById(mockEvent);

    expect(result).toStrictEqual({
      statusCode: 404,
      body: JSON.stringify({ message: "Product Not Found" }),
      headers,
    });
  });
});
