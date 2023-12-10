import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const headers = {
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const fileName = event.queryStringParameters?.name;

    console.log(`fileName: ${fileName}`);

    if (!fileName) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          message: "File name is not provided",
        }),
      };
    }

    const client = new S3Client({ region: process.env.AWS_REGION });
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `uploaded/${fileName}`,
    });
    const presignedURL = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(presignedURL),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "some error happened",
      }),
    };
  }
};
