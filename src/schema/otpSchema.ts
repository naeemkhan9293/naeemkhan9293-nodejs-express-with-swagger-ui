import { OpenAPIV3 } from "openapi-types";

const otpSchema: Record<string, OpenAPIV3.SchemaObject> = {
  VerifyOtp: {
    type: "object",
    required: ["email", "otp"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
        description: "Email address of the user"
      },
      otp: {
        type: "string",
        example: "123456",
        description: "One-time password sent to the user's email"
      }
    }
  },
  ResendOtp: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
        description: "Email address of the user"
      }
    }
  },
  OtpResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
        description: "Indicates if the operation was successful"
      },
      message: {
        type: "string",
        example: "Account verified successfully",
        description: "A message describing the result of the operation"
      },
      data: {
        type: "object",
        properties: {
          verified: {
            type: "boolean",
            example: true,
            description: "Indicates if the account is verified"
          }
        }
      },
      statusCode: {
        type: "integer",
        example: 200,
        description: "HTTP status code"
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2023-05-15T10:30:00.000Z",
        description: "Timestamp of the response"
      }
    }
  }
};

export default otpSchema;
