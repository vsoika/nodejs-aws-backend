import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "dotenv/config";
import { getOneProduct } from "../../utils/getOneProduct";

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

    if (!productId) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          message: "Product ID has not been provided",
        }),
      };
    }
    const [requestedProduct] = await getOneProduct(productId);

    console.log(`Lambda handler, event: ${event}`);

    if (!requestedProduct) {
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
