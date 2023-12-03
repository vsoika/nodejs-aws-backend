import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { IProduct } from "../../types";

export const getOneProduct = async (productId: string) => {
  const productCommand = new QueryCommand({
    TableName: process.env.DB_PRODUCT_TABLE,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: { ":id": { S: productId } },
  });

  const stockCommand = new QueryCommand({
    TableName: process.env.DB_STOCK_TABLE,
    KeyConditionExpression: "product_id = :product_id",
    ExpressionAttributeValues: { ":product_id": { S: productId } },
  });

  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const productResponse = await docClient.send(productCommand);
  const stockResponse = await docClient.send(stockCommand);

  const combinedData = productResponse?.Items?.map((productItem) => {
    const unmarshalledProductItem = unmarshall(productItem);

    const stock = stockResponse.Items?.find((stockItem) => {
      const unmarshalledStockItem = unmarshall(stockItem);

      return unmarshalledStockItem["product_id"] === unmarshalledProductItem.id;
    });

    if (stock)
      return { ...unmarshalledProductItem, count: unmarshall(stock).count };
    return productItem;
  });

  return combinedData as unknown as IProduct[];
};
