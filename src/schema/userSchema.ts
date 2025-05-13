// src/docs/schemas/user.openapi.ts
import { OpenAPIV3 } from "openapi-types";

const userSchema: Record<string, OpenAPIV3.SchemaObject> = {
  User: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: {
        type: "string",
        example: "John Doe",
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
    },
  },
};

export default userSchema;
