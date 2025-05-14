// src/docs/schemas/user.openapi.ts
import { OpenAPIV3 } from "openapi-types";

const userSchema: Record<string, OpenAPIV3.SchemaObject> = {
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
};

export default userSchema;
