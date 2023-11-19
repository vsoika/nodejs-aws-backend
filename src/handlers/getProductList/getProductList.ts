import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { products } from "../../mocks/productsStubs";

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.productsId;
    const isExistingProductId = products.some(({ id }) => id === productId);

    if (!productId || !isExistingProductId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Product Not Found",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        products,
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "some error happened",
      }),
    };
  }
};
