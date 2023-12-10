import {
  SQSClient,
  SendMessageBatchCommand,
  GetQueueUrlCommand,
} from "@aws-sdk/client-sqs";
import { IProduct } from "../../types";
import { v4 as uuid } from "uuid";

const sqsClient = new SQSClient({});

export const sendDataToSqs = async (data: IProduct[]) => {
  const getQueueUrlCommand = new GetQueueUrlCommand({
    QueueName: process.env.SQS_QUEUE,
  });

  try {
    const { QueueUrl } = await sqsClient.send(getQueueUrlCommand);

    const entries = data.map((product) => {
      return {
        Id: uuid(),
        MessageBody: JSON.stringify({
          title: product.title,
          description: product.description,
          price: Number(product.price),
          count: Number(product.count),
        }),
      };
    });

    const sendMessageBatchCommand = new SendMessageBatchCommand({
      QueueUrl,
      Entries: entries,
    });

    await sqsClient.send(sendMessageBatchCommand);
    console.log("Send data to SQS");
  } catch (err) {
    console.log("error: ", err);
  }
};
