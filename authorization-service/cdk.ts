import * as lambda from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Stack, App } from "aws-cdk-lib";
import "dotenv/config";

const app = new App();
const stack = new Stack(app, "AuthorizationServiceStack", {
  env: { region: "eu-west-1" },
});

const lambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.AWS_REGION as string,
    GITHUB_CREDENTIALS: process.env.GITHUB_CREDENTIALS as string,
  },
};

const basicAuthorizerFn = new NodejsFunction(stack, "BasicAuthorizerLambda", {
  ...lambdaProps,
  entry: "src/handlers/basicAuthorizer/basicAuthorizer.ts",
  functionName: "basicAuthorizer",
  handler: "lambdaHandler",
});
