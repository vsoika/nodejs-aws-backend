import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Stack, App } from "aws-cdk-lib";
import { IMPORT_URL } from "./src/constants";
import "dotenv/config";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Bucket } from "aws-cdk-lib/aws-s3";

const app = new App();
const stack = new Stack(app, "ImportServiceStack", {
  env: { region: "eu-west-1" },
});

const s3Bucket = s3.Bucket.fromBucketName(
  stack,
  "ImportServiceBucket",
  process.env.S3_BUCKET as string
) as Bucket;

const lambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.AWS_REGION as string,
    S3_BUCKET: process.env.S3_BUCKET as string,
  },
};

const importProductsFileFn = new NodejsFunction(
  stack,
  "ImportProductsFileLambda",
  {
    ...lambdaProps,
    entry: "src/handlers/importProductsFile/importProductsFile.ts",
    functionName: "importProductsFile",
    handler: "lambdaHandler",
  }
);

const importFileParserFn = new NodejsFunction(stack, "ImportFileParserLambda", {
  ...lambdaProps,
  entry: "src/handlers/importFileParser/importFileParser.ts",
  functionName: "importFileParser",
  handler: "lambdaHandler",
});

const importProductsFileIntegration = new apiGateway.LambdaIntegration(
  importProductsFileFn
);

s3Bucket.grantReadWrite(importProductsFileFn);
s3Bucket.grantReadWrite(importFileParserFn);

importFileParserFn.addEventSource(
  new S3EventSource(s3Bucket, {
    events: [s3.EventType.OBJECT_CREATED],
    filters: [{ prefix: "uploaded/" }],
  })
);

const api = new apiGateway.RestApi(stack, "ImportApi", {
  restApiName: "ImportServiceApi",
  defaultCorsPreflightOptions: {
    allowHeaders: ["*"],
    allowOrigins: ["*"],
    allowMethods: apiGateway.Cors.ALL_METHODS,
  },
});

const importResource = api.root.addResource(IMPORT_URL);

importResource.addMethod("GET", importProductsFileIntegration, {
  requestParameters: {
    "method.request.querystring.name": true,
  },
});

new cdk.CfnOutput(stack, "ApiUrl", {
  value: `${api.url}import`,
});
