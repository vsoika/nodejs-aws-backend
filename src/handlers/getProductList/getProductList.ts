import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { products } from "../../mocks/productsStubs";
import { headers } from "../getProductById/getProductById";

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(products),
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
