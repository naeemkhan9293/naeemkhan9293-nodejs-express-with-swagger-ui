import { Request, Response, NextFunction } from "express";
import { logger } from "#src/config/logger";

/**
 * Middleware to log all incoming requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`Request: ${req.method} ${req.originalUrl}`, {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      "user-agent": req.headers["user-agent"],
      "content-type": req.headers["content-type"],
      authorization: req.headers["Authorization"],
    },
    ip: req.ip,
  });
  const originalSend = res.send;
  res.send = function (body): Response {
    const isJson = typeof body === "string" && body.startsWith("{") && body.endsWith("}");

    const isSmall = typeof body === "string" && body.length < 1000;
    if (isJson && isSmall) {
      try {
        const parsedBody = JSON.parse(body);
        logger.debug(`Response: ${req.method} ${req.originalUrl} ${res.statusCode}`, {
          statusCode: res.statusCode,
          body: parsedBody,
        });
      } catch (error) {
        logger.debug(`Response: ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
          statusCode: res.statusCode,
          body: "[Unparseable JSON]",
        });
      }
    } else {
      logger.debug(`Response: ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
        statusCode: res.statusCode,
        body: "[Response body too large or not JSON]",
      });
    }
    return originalSend.call(this, body);
  };
  next();
};
