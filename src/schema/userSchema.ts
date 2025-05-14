import { OpenAPIV3 } from "openapi-types";

const userSchema: Record<string, OpenAPIV3.SchemaObject> = {
  RefreshToken: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        description: "JWT refresh token received during login",
      },
    },
  },
  RefreshTokenResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
        description: "Indicates if the token refresh was successful",
      },
      message: {
        type: "string",
        example: "Token refreshed successfully",
        description: "A message describing the result of the token refresh",
      },
      data: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            description: "New JWT access token",
          },
        },
      },
      statusCode: {
        type: "integer",
        example: 200,
        description: "HTTP status code",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2023-05-15T10:30:00.000Z",
        description: "Timestamp of the response",
      },
    },
  },
  User: {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
      username: {
        type: "string",
        example: "JohnDoe123",
      },
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "strongpassword123",
      },
      role: {
        type: "string",
        enum: ["customer", "seller", "admin", "superadmin"],
        example: "customer",
      },
      phone: {
        type: "string",
        example: "+1234567890",
      },
    },
  },
  Login: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
        description: "Email address of the user",
      },
      password: {
        type: "string",
        format: "password",
        example: "strongpassword123",
        description: "User's password",
      },
    },
  },
  LoginResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
        description: "Indicates if the login was successful",
      },
      message: {
        type: "string",
        example: "Login successful",
        description: "A message describing the result of the login attempt",
      },
      data: {
        type: "object",
        properties: {
          user: {
            type: "object",
            description: "User information",
            properties: {
              _id: {
                type: "string",
                example: "60d0fe4f5311236168a109ca",
                description: "User ID",
              },
              username: {
                type: "string",
                example: "JohnDoe123",
                description: "Username",
              },
              email: {
                type: "string",
                example: "john@example.com",
                description: "Email address",
              },
              role: {
                type: "string",
                example: "customer",
                description: "User role",
              },
              verified: {
                type: "boolean",
                example: true,
                description: "Whether the user's account is verified",
              },
            },
          },
          accessToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            description: "JWT access token",
          },
          refreshToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            description: "JWT refresh token",
          },
          verificationData: {
            type: "object",
            description: "Verification data (only provided if user is not verified)",
            properties: {
              verificationToken: {
                type: "string",
                example: "a1b2c3d4e5f6",
                description: "Token to be used with OTP for verification",
              },
            },
          },
        },
      },
      statusCode: {
        type: "integer",
        example: 200,
        description: "HTTP status code",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2023-05-15T10:30:00.000Z",
        description: "Timestamp of the response",
      },
    },
  },
};

export default userSchema;
