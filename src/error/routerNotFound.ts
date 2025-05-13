import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "#src/error/AppError";

const routerNotFound = async (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Can't find ${req.originalUrl} on the server!`);
  return next(error);
};

export default routerNotFound;
