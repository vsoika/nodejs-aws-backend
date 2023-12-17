import { headers } from "../../handlers/getProductById/getProductById";
import { APIGatewayProxyResult } from "aws-lambda";
import { IProduct } from "../../types";
import { validateProduct } from "../validateProduct";
import { v4 as uuid } from "uuid";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const sendProductToDataBase = async (
  body: IProduct
): Promise<APIGatewayProxyResult> => {
  const isBodyValid = validateProduct(body);

  console.log(`POST: body data is ${isBodyValid ? "valid" : "invalid"}`);

  if (!isBodyValid) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "Body json structure is not valid",
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

  await docClient.send(command);

  console.log(`New Item was added in database, body: ${body}`);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(body),
  };
};
