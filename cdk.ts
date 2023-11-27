import * as cdk from "aws-cdk-lib";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Stack, App } from "aws-cdk-lib";
import { PRODUCTS_URL } from "./src/constants";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import "dotenv/config";

const app = new App();
const stack = new Stack(app, "ProductServiceStack", {
  env: { region: "eu-west-1" },
});

const lambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.AWS_REGION as string,
    DB_PRODUCT_TABLE: process.env.AWS_DB_PRODUCT_TABLE as string,
    DB_STOCK_TABLE: process.env.AWS_DB_STOCK_TABLE as string,
  },
};

const getProductsList = new NodejsFunction(stack, "GetProductsListLambda", {
  ...lambdaProps,
  entry: "src/handlers/getProductList/getProductList.ts",
  functionName: "getProductsList",
  handler: "lambdaHandler",
});

const getProductById = new NodejsFunction(stack, "GetProductByIdLambda", {
  ...lambdaProps,
  entry: "src/handlers/getProductById/getProductById.ts",
  functionName: "getProductById",
  handler: "lambdaHandler",
});

const createProduct = new NodejsFunction(stack, "CreateProductLambda", {
  ...lambdaProps,
  entry: "src/handlers/createProduct/createProduct.ts",
  functionName: "createProduct",
  handler: "lambdaHandler",
});

const productsTable = Table.fromTableName(
  stack,
  "productsTable",
  process.env.AWS_DB_PRODUCT_TABLE as string
);
const stocksTable = Table.fromTableName(
  stack,
  "stocksTable",
  process.env.AWS_DB_STOCK_TABLE as string
);

productsTable.grantReadWriteData(getProductsList);
productsTable.grantReadWriteData(getProductById);
productsTable.grantReadWriteData(createProduct);

stocksTable.grantReadWriteData(getProductsList);
stocksTable.grantReadWriteData(getProductById);
stocksTable.grantReadWriteData(createProduct);

const api = new apiGateway.HttpApi(stack, "ProductApi", {
  corsPreflight: {
    allowHeaders: ["*"],
    allowMethods: [
      apiGateway.CorsHttpMethod.OPTIONS,
      apiGateway.CorsHttpMethod.GET,
      apiGateway.CorsHttpMethod.POST,
      apiGateway.CorsHttpMethod.PUT,
      apiGateway.CorsHttpMethod.PATCH,
      apiGateway.CorsHttpMethod.DELETE,
    ],
    allowOrigins: ["*"],
  },
});

api.addRoutes({
  path: PRODUCTS_URL,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration(
    "GetProductsListLambdaIntegration",
    getProductsList
  ),
});

api.addRoutes({
  path: PRODUCTS_URL,
  methods: [apiGateway.HttpMethod.POST],
  integration: new HttpLambdaIntegration(
    "CreateProductLambdaIntegration",
    createProduct
  ),
});

api.addRoutes({
  path: `${PRODUCTS_URL}/{productId}`,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration(
    "GetProductsByIdIntegration",
    getProductById
  ),
});

new cdk.CfnOutput(stack, "ApiUrl", {
  value: `${api.url}products`,
});
