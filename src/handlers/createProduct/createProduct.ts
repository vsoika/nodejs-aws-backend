import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { headers } from "../getProductById/getProductById";

import { validateProduct } from "../../utils/validateProduct";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { IProduct } from "../../types";
import "dotenv/config";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body as string) as IProduct;

    const isBodyValid = validateProduct(body);

    console.log(`POST: body data is ${isBodyValid ? "valid" : "invalid"}`);

    if (!isBodyValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "request data is not valid",
        }),
      };
    }

    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.AWS_DB_PRODUCT_TABLE,
            Item: {
              id: body.id,
              title: body.title,
              description: body.description,
              price: body.price,
            },
          },
        },
        {
          Put: {
            TableName: process.env.AWS_DB_STOCK_TABLE,
            Item: {
              product_id: body.id,
              count: body.count,
            },
          },
        },
      ],
    });

    const response = await docClient.send(command);

    console.log(`New Item was added in database, response: ${response}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(body),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "unable to create new product",
      }),
    };
  }
};
