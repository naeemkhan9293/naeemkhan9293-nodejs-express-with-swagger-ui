import { Request, Response } from "express";
import userRepos from "#src/repos/user.repos";
import { InternalServerError, UnauthorizedError } from "#src/error/AppError";
import ApiResponse from "#src/utils/ApiResponse";

const register = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (role === "admin" || role === "superadmin") {
      throw new UnauthorizedError("You are not authorized to create an admin account");
    }
    const user = await userRepos.createUser(req.body);
    return res.status(201).json(ApiResponse.success("User created successfully", user, 201));
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("An unknown error occurred");
  }
};

const user = { register };
export default user;
