import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { products } from "../../mocks/productsStubs";
import "dotenv/config";
import { IProduct } from "../../types";

const dbclient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dbDocClient = DynamoDBDocumentClient.from(dbclient);

const productData = products.map((item) => {
  const copy: Partial<IProduct> = { ...item };
  delete copy.count;
  return copy;
});

const stockData = products.map((item) => {
  return { product_id: item.id, count: item.count };
});

const fillDBTablesWithJsonData = async (tableName: string) => {
  if (tableName === process.env.AWS_DB_STOCK_TABLE) {
    stockData.forEach(async (product) => {
      const stockCommand = new PutCommand({
        TableName: process.env.AWS_DB_STOCK_TABLE,
        Item: product,
      });

      try {
        await dbDocClient.send(stockCommand);
      } catch (error) {
        console.log(error);
      }
    });
  }

  if (tableName === process.env.AWS_DB_PRODUCT_TABLE) {
    productData.forEach(async (product) => {
      const productCommand = new PutCommand({
        TableName: process.env.AWS_DB_PRODUCT_TABLE,
        Item: product,
      });

      try {
        await dbDocClient.send(productCommand);
      } catch (error) {
        console.log(error);
      }
    });
  }
};

(async () => {
  try {
    await fillDBTablesWithJsonData(process.env.AWS_DB_PRODUCT_TABLE as string);
    await fillDBTablesWithJsonData(process.env.AWS_DB_STOCK_TABLE as string);
    console.log("Data has been added in database");
  } catch (err) {
    console.error(err);
  }
})();
