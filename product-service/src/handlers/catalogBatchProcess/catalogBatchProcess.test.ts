import { SQSEvent, Context } from "aws-lambda";
import { lambdaHandler as catalogBatchProcess } from "./catalogBatchProcess";
import * as sendProductToDataBase from "../../utils/sendProductToDataBase";
import { mockClient } from "aws-sdk-client-mock";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const mockSendProductToDataBase = jest.fn();
const snsClientMock = mockClient(SNSClient);

const mockEvent = {
  Records: [
    {
      body: JSON.stringify({
        title: "title",
        description: "description",
        price: 30,
        count: 3,
      }),
    },
    {
      body: JSON.stringify({
        title: "title2",
        description: "description2",
        price: 40,
        count: 5,
      }),
    },
  ],
} as unknown as SQSEvent;

describe("catalogBatchProcess", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    snsClientMock.reset();
    jest
      .spyOn(sendProductToDataBase, "sendProductToDataBase")
      .mockImplementation(mockSendProductToDataBase);
  });
  it("should return successful response", async () => {
    snsClientMock.on(PublishCommand).resolves({});

    const result = await catalogBatchProcess(
      mockEvent,
      {} as Context,
      jest.fn()
    );

    expect(mockSendProductToDataBase).toHaveBeenCalledTimes(
      mockEvent.Records.length
    );
    expect(result.statusCode).toEqual(200);
  });

  it("should return rejected response if body does not exists", async () => {
    const mockEvent = {
      Records: [{}, {}],
    } as unknown as SQSEvent;

    const result = await catalogBatchProcess(
      mockEvent,
      {} as Context,
      jest.fn()
    );

    expect(mockSendProductToDataBase).not.toHaveBeenCalled();
    expect(result.statusCode).toEqual(404);
  });

  it("should return rejected response in case of any error", async () => {
    snsClientMock.on(PublishCommand).rejects({});

    const result = await catalogBatchProcess(
      mockEvent,
      {} as Context,
      jest.fn()
    );

    expect(mockSendProductToDataBase).toHaveBeenCalled();
    expect(result.statusCode).toEqual(500);
  });
});
