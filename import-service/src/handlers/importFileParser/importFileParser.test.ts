import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import * as sdkStreamMixin from "@aws-sdk/util-stream-node";
import * as sendDataToSqs from "../../utils/sendDataToSqs/sendDataToSqs";
import { SdkStream, StreamingBlobPayloadOutputTypes } from "@smithy/types";
import internal = require("stream");
import { mockClient } from "aws-sdk-client-mock";
import { lambdaHandler as importFileParser } from "./importFileParser";
import { S3Event } from "aws-lambda";

const s3Mock = mockClient(S3Client);
const mockKey = "key";
const mockEvent = {
  Records: [{ s3: { object: { key: mockKey } } }],
} as S3Event;

const mockStreamOn = jest
  .fn()
  .mockImplementation(function (this: any, event, handler) {
    if (event === "end" || "error") {
      handler();
    }
    return this;
  });

const mockStream = {
  pipe: jest.fn().mockReturnThis(),
  on: mockStreamOn,
};

jest.mock("@aws-sdk/util-stream-node", () => {
  return {
    __esModule: true,
    ...jest.requireActual("@aws-sdk/util-stream-node"),
  };
});

const mockSendDataToSqs = jest.fn();

describe("importFileParser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    s3Mock.reset();

    const mockSdkStreamMixin = jest.spyOn(sdkStreamMixin, "sdkStreamMixin");
    mockSdkStreamMixin.mockImplementation(
      () => mockStream as unknown as SdkStream<internal.Readable>
    );

    jest
      .spyOn(sendDataToSqs, "sendDataToSqs")
      .mockImplementation(mockSendDataToSqs);
  });

  it("should return successful response", async () => {
    s3Mock
      .on(GetObjectCommand)
      .resolves({ Body: {} as StreamingBlobPayloadOutputTypes });

    s3Mock.on(CopyObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});

    const logSpy = jest.spyOn(console, "log");

    try {
      await importFileParser(mockEvent);
    } catch {}

    expect(s3Mock.call(0).args[0].input).toEqual({
      Bucket: process.env.S3_BUCKET,
      Key: mockKey,
    });

    expect(mockStream.pipe).toHaveBeenCalledTimes(1);
    expect(mockStream.on).toHaveBeenCalledWith("data", expect.any(Function));
    expect(mockStream.on).toHaveBeenCalledWith("end", expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith(
      `${mockKey} file is successfully copied to /parsed folder`
    );
    expect(logSpy).toHaveBeenCalledWith(
      `${mockKey} file is successfully deleted from /uploaded folder`
    );
    expect(mockSendDataToSqs).toHaveBeenCalled();
  });

  it("should handle failed response", async () => {
    s3Mock.on(GetObjectCommand).rejects;

    let isError = false;

    try {
      await importFileParser(mockEvent);
    } catch {
      isError = true;
    }

    expect(isError).toBeTruthy();
  });
});
