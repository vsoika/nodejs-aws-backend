import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { headers } from "../getProductById/getProductById";
import { v4 as uuid } from "uuid";

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

    const id = uuid();

    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.DB_PRODUCT_TABLE,
            Item: {
              id: id,
              title: body.title,
              description: body.description,
              price: body.price,
            },
          },
        },
        {
          Put: {
            TableName: process.env.DB_STOCK_TABLE,
            Item: {
              product_id: id,
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
        message: `unable to create new product`,
      }),
    };
  }
};
