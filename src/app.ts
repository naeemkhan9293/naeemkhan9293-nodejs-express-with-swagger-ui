import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import { logger, stream } from "#src/config/logger";
import { requestLogger } from "#src/middleware/requestLogger";
import { setupSwagger } from "#src/swagger";
import routesIndex from "#src/routes/index";
import errorHandler from "./middleware/errorHandler";

import dotenv from "dotenv";
import connectDB from "./config/db";
dotenv.config();

connectDB();

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", { stream }));

if (process.env.NODE_ENV !== "production") {
  logger.info("Request logger enabled");
  app.use(requestLogger);
}

// Setup Swagger
setupSwagger(app);

app.get("/", (_req, res) => {
  res.redirect("/api-docs");
});

app.use("/api", routesIndex);
app.use(errorHandler);

export { app, server };
