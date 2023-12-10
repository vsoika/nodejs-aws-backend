import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { headers } from "../getProductById/getProductById";
import { IProduct } from "../../types";
import "dotenv/config";
import { sendProductToDataBase } from "../../utils/sendProductToDataBase";

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body as string) as IProduct;

    return await sendProductToDataBase(body);
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: `unable to create new product`,
      }),
    };
  }
};
