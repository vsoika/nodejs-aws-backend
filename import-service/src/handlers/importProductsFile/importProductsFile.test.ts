import { Bucket } from "aws-cdk-lib/aws-s3";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import * as sdkStreamMixin from "@smithy/util-stream-node/dist-types/sdk-stream-mixin";
import * as s3RequestPresigner from '@aws-sdk/s3-request-presigner'
import { SdkStream, StreamingBlobPayloadOutputTypes } from "@smithy/types";
import internal = require("stream");
import { mockClient } from "aws-sdk-client-mock";
import { Readable } from "stream";
import { lambdaHandler as importProductsFile } from "./importProductsFile";
import { S3Event } from "aws-lambda";
const csv = require('csv-parser');

const s3Mock = mockClient(S3Client);
const mockKey = "key";
const mockEvent = {
  Records: [{ s3: { object: { key: mockKey } } }],
} as S3Event;

// jest.mock('@smithy/util-stream-node/dist-types/sdk-stream-mixin');

describe("importProductsFile", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    s3Mock.reset();
    jest.useFakeTimers({ advanceTimers: true });
    // jest.useFakeTimers()
  });

  it("should return successful response", async () => {
    // create Stream from string
    // const stream = new Readable();
    // stream.push("hello world");
    // stream.push(null); // end of stream

    const mockStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation(function (event, handler) {
        handler();
        return;
      }),
    }

    // const mockSdkStreamMixin = jest.spyOn(sdkStreamMixin, "sdkStreamMixin");
    // mockSdkStreamMixin.mockImplementation(
    //   () => stream as SdkStream<internal.Readable>
    // );

    // // wrap the Stream with SDK mixin
    // const sdkStream = sdkStreamMixin(stream);

    s3Mock
      .on(PutObjectCommand)
      .resolves({});

    // const s3 = new S3Client({});

    // const getObjectResult = await s3.send(new GetObjectCommand({Bucket: '', Key: ''}));

    // const str = await getObjectResult.Body?.transformToString();

    // const result = await importProductsFile(mockEvent);

    // console.log(result);

    let isError = false;
    // try {
    //   await importProductsFile(mockEvent);
    // } catch {
    //   isError = true;
    // }

    // jest.setTimeout(100000);
    await importProductsFile(mockEvent);

    //  try {
    //   await importProductsFile(mockEvent);
    // } catch {
    //   isError = true;
    // }

    expect(s3Mock.call(0).args[0].input).toEqual({
      Bucket: process.env.S3_BUCKET,
      Key: mockKey,
    });

    // expect(result).toStrictEqual({
    //   statusCode: 200,
    //   body: JSON.stringify(products),
    //   headers,
    // });
  });
});
