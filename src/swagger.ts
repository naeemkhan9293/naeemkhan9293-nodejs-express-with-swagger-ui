import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import userSchema from "./schema/userSchema";
import otpSchema from "./schema/otpSchema";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "MY_TEST_PROJECT_API",
    version: "1.0.0",
    description: "API documentation for my application",
    contact: {
      name: "API Support",
      email: "naeemkhan9293g@gmail.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [{ url: "http://localhost:5000" }],
  tags: [
    {
      name: "General",
      description: "General endpoints",
    },
    {
      name: "Users",
      description: "User management endpoints",
    },
    {
      name: "Profile",
      description: "User profile endpoints",
    },
  ],
  components: {
    schemas: {
      ...userSchema,
      ...otpSchema,
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer {token}",
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  // Path to the API docs
  apis: ["./src/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

/**
 * Initialize Swagger UI
 * @param {Express} app - Express application
 */
const setupSwagger = (app: Express): void => {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true, // Keep authorization data when browser is refreshed
      docExpansion: "none", // Collapse all endpoints by default
      filter: true, // Enable filtering
      tagsSorter: "alpha", // Sort tags alphabetically
      operationsSorter: "alpha", // Sort operations alphabetically
      // Function to intercept the login response and set the bearer token
      responseInterceptor: (res: any) => {
        if (
          res.url.endsWith("/api/users/login") &&
          res.status === 200 &&
          res.data &&
          res.data.data &&
          res.data.data.accessToken
        ) {
          const accessToken = res.data.data.accessToken;
          // This will be executed in the browser
          const authorizationEvent = new CustomEvent("swaggerAuthorization", {
            detail: { token: accessToken },
          });
          window.dispatchEvent(authorizationEvent);
        }
        return res;
      },
    },
  };

  // Swagger page
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Docs in JSON format
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("Swagger UI initialized at /api-docs");
};

export { setupSwagger };
