import { Request, Response } from "express";
import ApiResponse from "#src/utils/ApiResponse";

/**
 * Get the current user's profile
 */
const getProfile = async (req: Request, res: Response) => {
  // The user is already attached to the request by the auth middleware
  const user = req.user;
  
  // Return the user profile without sensitive information
  return res.json(
    ApiResponse.success("Profile retrieved successfully", {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  );
};

const profile = { getProfile };
export default profile;
