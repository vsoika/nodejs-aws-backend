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

// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
// import "dotenv/config";

// const client = new DynamoDBClient({});
// const docClient = DynamoDBDocumentClient.from(client);

// const main = async () => {
//   const productCommand = new ScanCommand({
//     TableName: process.env.AWS_DB_PRODUCT_TABLE,
//   });
//   const stockCommand = new ScanCommand({
//     TableName: process.env.AWS_DB_STOCK_TABLE,
//   });

//   const productResponse = await docClient.send(productCommand);
//   const stockResponse = await docClient.send(stockCommand);

//   // console.log(response?.Items);

//   const res = productResponse.Items?.map((productItem) => {
//     const stock = stockResponse.Items?.find(
//       (stockItem) => stockItem["product_id"] === productItem.id
//     );
//     if (stock) return { ...productItem, count: stock.count };
//     return productItem;
//   });

//   console.log(res);
// };

// main();
