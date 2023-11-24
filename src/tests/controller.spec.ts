import { Request, Response } from "express";
import { startDatafetchingController } from "../controllers";

describe("Is function defined", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  let responeObject: any = {};

  beforeEach(() => {
    mockRequest = {
      body: {
        latitude: 0,
        longitude: 0,
      },
    };
    mockResponse = {
      statusCode: 200,
      send: jest.fn().mockImplementation((result) => {
        responeObject = result;
      }),
    };
  });

  test("Check 200 Response", () => {
    const expectedStatusCode = 200;
    const expectedResponse = {};
    startDatafetchingController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.statusCode).toBe(expectedStatusCode);
    expect(typeof responeObject).toEqual(typeof expectedResponse);
  });
});
