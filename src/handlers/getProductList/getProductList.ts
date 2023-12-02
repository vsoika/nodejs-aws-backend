import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { headers } from "../getProductById/getProductById";

import { getAllDataFromDB } from "../../utils/getAllDataFromDB";
import { IProduct } from "../../types";
import "dotenv/config";

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`Lambda handler, event: ${event}`);

    const combinedData = await getAllDataFromDB();

    if (!combinedData || !combinedData.length) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          message: "Requested data has not been found",
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(combinedData as IProduct[]),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: `${err}`,
      }),
    };
  }
};
