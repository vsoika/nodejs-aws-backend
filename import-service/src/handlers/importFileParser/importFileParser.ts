import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";
import { S3Event } from "aws-lambda";
import { IProduct } from "../../types";
import { sendDataToSqs } from "../../utils/sendDataToSqs/sendDataToSqs";
const csv = require("csv-parser");

export const lambdaHandler = async (
  event: S3Event
): Promise<unknown[] | void> => {
  console.log(`importFileParser lambda, event: ${event}`);

  try {
    const s3Client = new S3Client({});

    const promises = event.Records.map(async (record) => {
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
      };

      console.log("Key: ", key);

      const records: IProduct[] = [];

      const { Body } = await s3Client.send(new GetObjectCommand(params));

      const stream = await sdkStreamMixin(Body);

      return new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on("data", (data: any) => {
            records.push(data);
          })
          .on("error", (error: any) => {
            console.error(error);
            reject(error);
          })
          .on("end", async () => {
            console.log(`New .csv file is successfully parsed`);
            try {
              const copyCommand = new CopyObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: key.replace("uploaded", "parsed"),
                CopySource: `${process.env.S3_BUCKET}/${key}`,
              });
              await s3Client.send(copyCommand);
              console.log(
                `${key} file is successfully copied to /parsed folder`
              );

              await s3Client.send(new DeleteObjectCommand(params));
              console.log(
                `${key} file is successfully deleted from /uploaded folder`
              );

              await sendDataToSqs(records);
            } catch (err) {
              console.log(`onEnd error: ${err}`);
            }
          });
      });
    });

    return Promise.all(promises);
  } catch (err) {
    console.log(`Parse error: ${err}`);
  }
};
