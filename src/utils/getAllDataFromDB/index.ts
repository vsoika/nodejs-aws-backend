import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { IProduct } from "../../types";
import "dotenv/config";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const getAllDataFromDB = async (): Promise<
  IProduct[] | undefined | void
> => {
  try {
    const productCommand = new ScanCommand({
      TableName: 'product_model',
    });
    const stockCommand = new ScanCommand({
      TableName: 'stock_model',
    });

    const productResponse = await docClient.send(productCommand);
    const stockResponse = await docClient.send(stockCommand);

    const combinedData = productResponse.Items?.map((productItem) => {
      const stock = stockResponse.Items?.find(
        (stockItem) => stockItem["product_id"] === productItem.id
      );
      if (stock) return { ...productItem, count: stock.count };
      return productItem;
    });

    return combinedData as unknown as IProduct[];
  } catch (err) {
    console.log(err, process.env.AWS_DB_PRODUCT_TABLE);
  }
};
