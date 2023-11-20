import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { products } from "../../mocks/productsStubs";

export const headers = {
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.productId;
    const requestedProduct = products.find(({ id }) => id === productId);

    if (!productId || !requestedProduct) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          message: "Product Not Found",
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(requestedProduct),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "some error happened",
      }),
    };
  }
};
