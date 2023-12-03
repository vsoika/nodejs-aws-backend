import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";
import { S3Event } from "aws-lambda";
const csv = require('csv-parser');

export const lambdaHandler = async (event: S3Event): Promise<unknown[]| void> => {
  console.log(`importFileParser lambda, event: ${event}`);

  try {
    const s3Client = new S3Client({});

    const promises = event.Records.map(async (record) => {
      const Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

      const { Body } = await s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key,
        })
      );

      const stream = await sdkStreamMixin(Body);

      return new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on("data", (data: any) => {
            console.log(`csv data: ${JSON.stringify(data)}`);
          })
          .on("error", (error: any) => {
            console.error(error);
            reject(error);
          })
          .on("end",  () => {
            console.log(`New .csv file is successfully parsed`);
          });
      });
    });

   return Promise.all(promises);

  } catch (err) {
    console.log(`Parse error: ${err}`);
  }
};
