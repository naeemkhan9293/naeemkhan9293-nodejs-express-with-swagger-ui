import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "#src/error/AppError";
import serverConfig from "#src/config/serverConfig";
import { Types } from "mongoose";
import userRepos from "#src/repos/user.repos";

/**
 * Interface for the decoded JWT token
 */
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Extend Express Request interface to include user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token from the Authorization header
 * Adds the user to the request object if authentication is successful
 */
const auth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided. Authorization denied.");
    }
    
    // Extract token from Bearer format
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      throw new UnauthorizedError("Invalid token format. Authorization denied.");
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, serverConfig.accessTokenSecret) as DecodedToken;
      
      // Get user from database
      const user = await userRepos.getUserById(new Types.ObjectId(decoded.id));
      
      if (!user) {
        throw new UnauthorizedError("User not found. Authorization denied.");
      }
      
      // Add user to request object
      req.user = user;
      
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Token expired. Please login again.");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid token. Authorization denied.");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

export default auth;
