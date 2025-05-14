import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

const logsDir = path.join(__dirname, "logs");

// Create the logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(info => {
    const { level, message, timestamp, stack, ...metadata } = info;
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (stack) {
      logMessage = `${logMessage}\n${stack}`;
    }
    if (Object.keys(metadata).length > 0) {
      try {
        logMessage = `${logMessage} ${JSON.stringify(metadata, null, 2)}`;
      } catch (e) {
        logMessage = `${logMessage} [Metadata could not be stringified]`;
      }
    }
    return logMessage;
  })
);

// Define colored console format for development
const coloredConsoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  logFormat
);

const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  format: logFormat,
  maxSize: "20m",
  maxFiles: "7d",
});

const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  format: logFormat,
  maxSize: "20m",
  maxFiles: "7d",
});

const consoleTransport = new winston.transports.Console({
  format: coloredConsoleFormat,
  level: "debug",
});

const logger = winston.createLogger({
  level: "debug",
  format: logFormat,
  defaultMeta: { service: "user-service" },
  transports: [errorFileTransport, fileTransport, consoleTransport],
});

const stream = {
  write: (message: string) => {
    logger.info(message);
  },
};

export { logger, stream };
