import Token from "#src/models/tokens";
import { IToken } from "#src/types/common";
import { Types } from "mongoose";
import { hashToken } from "#src/utils/utils";

/**
 * Creates a new token in the database
 * @param userId - The ID of the user this token belongs to
 * @param token - The plain token string
 * @param type - The type of token (email_verification, password_reset, otp)
 * @param expiresAt - When the token expires
 * @returns The created token document
 */
const createToken = async (
  userId: Types.ObjectId,
  token: string | number,
  type: string,
  expiresAt: Date
): Promise<IToken> => {
  // Hash the token before storing it
  const tokenHash = await hashToken(token.toString());
  
  const newToken = new Token({
    userId,
    tokenHash,
    type,
    expiresAt,
  });
  
  return newToken.save();
};

/**
 * Finds a token by user ID and type
 * @param userId - The ID of the user
 * @param type - The type of token to find
 * @returns The token document or null if not found
 */
const findTokenByUserIdAndType = async (
  userId: Types.ObjectId,
  type: string
): Promise<IToken | null> => {
  return Token.findOne({ userId, type });
};

/**
 * Deletes a token by its ID
 * @param tokenId - The ID of the token to delete
 * @returns The deleted token document or null if not found
 */
const deleteTokenById = async (tokenId: Types.ObjectId): Promise<IToken | null> => {
  return Token.findByIdAndDelete(tokenId);
};

/**
 * Deletes all tokens for a specific user
 * @param userId - The ID of the user
 * @returns The delete result
 */
const deleteTokensByUserId = async (userId: Types.ObjectId) => {
  return Token.deleteMany({ userId });
};

const tokenRepos = {
  createToken,
  findTokenByUserIdAndType,
  deleteTokenById,
  deleteTokensByUserId,
};

export default tokenRepos;
