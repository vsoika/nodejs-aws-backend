import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as s3RequestPresigner from "@aws-sdk/s3-request-presigner";
import { mockClient } from "aws-sdk-client-mock";
import {
  headers,
  lambdaHandler as importProductsFile,
} from "./importProductsFile";
import { APIGatewayProxyEvent } from "aws-lambda";

const s3Mock = mockClient(S3Client);
const mockSignedUrl = "url";
const mockEvent = {
  queryStringParameters: {
    name: "test",
  },
} as unknown as APIGatewayProxyEvent;

jest.mock("@aws-sdk/s3-request-presigner", () => {
  return {
    __esModule: true,
    ...jest.requireActual("@aws-sdk/s3-request-presigner"),
  };
});

describe("importProductsFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    s3Mock.reset();
  });

  it("should return successful response", async () => {
    jest
      .spyOn(s3RequestPresigner, "getSignedUrl")
      .mockResolvedValue(mockSignedUrl);

    s3Mock.on(PutObjectCommand).resolves({});

    const result = await importProductsFile(mockEvent);

    expect(result).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify(mockSignedUrl),
      headers,
    });
  });

  it("should return 404 when file name is not provided", async () => {
    const mockEvent = {
      queryStringParameters: {},
    } as unknown as APIGatewayProxyEvent;

    jest
      .spyOn(s3RequestPresigner, "getSignedUrl")
      .mockResolvedValue(mockSignedUrl);

    s3Mock.on(PutObjectCommand).resolves({});

    const result = await importProductsFile(mockEvent);

    expect(result).toStrictEqual({
      statusCode: 404,
      body: JSON.stringify({
        message: "File name is not provided",
      }),
      headers,
    });
  });

  it("should return 500 status code when server error happened", async () => {
    jest
      .spyOn(s3RequestPresigner, "getSignedUrl")
      .mockRejectedValue('');

    s3Mock.on(PutObjectCommand).rejects();

    const result = await importProductsFile(mockEvent);

    expect(result).toStrictEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: "some error happened",
      }),
      headers,
    });
  });
});
