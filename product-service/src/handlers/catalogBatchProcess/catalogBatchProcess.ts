import { Handler, SQSEvent } from "aws-lambda";
import { IProduct } from "../../types";
import { sendProductToDataBase } from "../../utils/sendProductToDataBase";
import { headers } from "../getProductById/getProductById";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});

export const lambdaHandler: Handler = async (event: SQSEvent) => {
  try {
    const result = [];

    for (const record of event.Records) {
      if (!record.body) {
        return {
          statusCode: 404,
          body: JSON.stringify({ messages: "No Body in SQS Message." }),
          headers,
        };
      }

      const body = JSON.parse(record.body as string) as IProduct;

      await sendProductToDataBase(body);
      result.push(body);

      await snsClient.send(
        new PublishCommand({
          Subject: "New item has been added to Product catalog",
          Message: JSON.stringify({
            title: body.title,
            description: body.description,
            price: Number(body.price),
            count: Number(body.count),
          }),
          TargetArn: process.env.SNS_PRODUCT_TOPIC_ARN,
        })
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ messages: result }),
      headers,
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
