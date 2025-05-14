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
  ],
  components: {
    schemas: {
      ...userSchema,
      ...otpSchema,
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
  // Swagger page
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("Swagger UI initialized at /api-docs");
};

export { setupSwagger };
