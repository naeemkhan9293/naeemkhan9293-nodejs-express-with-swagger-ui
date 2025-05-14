import Token from "#src/models/tokens";
import { IToken } from "#src/types/common";
import { Types } from "mongoose";
import { hashToken, compareTokens } from "#src/utils/utils";
import crypto from "crypto";

// Maximum number of verification attempts allowed
const MAX_VERIFICATION_ATTEMPTS = 5;
// Cooldown period in minutes after max attempts reached
const VERIFICATION_COOLDOWN_MINUTES = 30;

/**
 * Creates a new token in the database
 * @param userId - The ID of the user this token belongs to
 * @param token - The plain token string (OTP)
 * @param verificationToken - The verification token to be sent with the OTP
 * @param type - The type of token (email_verification, password_reset, otp)
 * @param expiresAt - When the token expires
 * @returns The created token document
 */
const createToken = async (
  userId: Types.ObjectId,
  token: string | number,
  type: string,
  expiresAt: Date,
  verificationToken: string
): Promise<IToken> => {
  // Hash the token before storing it
  const tokenHash = await hashToken(token.toString());

  const newToken = new Token({
    userId,
    tokenHash,
    verificationToken,
    type,
    expiresAt,
    verificationAttempts: 0,
    lastAttemptAt: null,
    isBlocked: false,
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
 * Finds a token by its verification token
 * @param verificationToken - The verification token to find
 * @returns The token document or null if not found
 */
const findTokenByVerificationToken = async (verificationToken: string): Promise<IToken | null> => {
  return Token.findOne({ verificationToken });
};

/**
 * Creates a refresh token in the database
 * @param userId - The ID of the user this token belongs to
 * @param refreshToken - The plain refresh token string
 * @param expiresAt - When the token expires
 * @returns The created token document
 */
const createRefreshToken = async (
  userId: Types.ObjectId,
  refreshToken: string,
  expiresAt: Date
): Promise<IToken> => {
  
  const tokenHash = await hashToken(refreshToken);

  // This is not sent to the client but used internally for token management
  const verificationToken = crypto.randomBytes(16).toString("hex");

  const newToken = new Token({
    userId,
    tokenHash,
    verificationToken,
    type: "refresh_token",
    expiresAt,
    verificationAttempts: 0,
    lastAttemptAt: null,
    isBlocked: false,
  });

  return newToken.save();
};

/**
 * Finds a refresh token by user ID
 * @param userId - The ID of the user
 * @returns The token document or null if not found
 */
const findRefreshTokenByUserId = async (userId: Types.ObjectId): Promise<IToken | null> => {
  return Token.findOne({ userId, type: "refresh_token" });
};

/**
 * Validates a refresh token
 * @param userId - The ID of the user
 * @param refreshToken - The plain refresh token to validate
 * @returns An object with validation result and reason if invalid
 */
const validateRefreshToken = async (
  userId: Types.ObjectId,
  refreshToken: string
): Promise<{ isValid: boolean; reason?: string; token?: IToken }> => {
  const token = await findRefreshTokenByUserId(userId);

  if (!token) {
    return { isValid: false, reason: "Refresh token not found" };
  }

  // Check if token is blocked
  if (token.isBlocked) {
    return { isValid: false, reason: "Refresh token is blocked" };
  }

  // Check if token has expired
  const now = new Date();
  if (now > token.expiresAt) {
    return { isValid: false, reason: "Refresh token has expired" };
  }

  // Verify the token hash
  const isValid = await compareTokens(refreshToken, token.tokenHash);
  if (!isValid) {
    return { isValid: false, reason: "Invalid refresh token" };
  }

  return { isValid: true, token };
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

/**
 * Records a verification attempt for a token
 * @param tokenId - The ID of the token
 * @returns The updated token document or null if not found
 */
const recordVerificationAttempt = async (tokenId: Types.ObjectId): Promise<IToken | null> => {
  const token = await Token.findById(tokenId);

  if (!token) return null;

  token.verificationAttempts += 1;
  token.lastAttemptAt = new Date();

  // Block the token if max attempts reached
  if (token.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    token.isBlocked = true;
  }

  return token.save();
};

/**
 * Checks if a token is valid for verification
 * @param token - The token document to validate
 * @returns An object with validation result and reason if invalid
 */
const validateTokenForVerification = (token: IToken): { isValid: boolean; reason?: string } => {
  const now = new Date();

  // Check if token is blocked
  if (token.isBlocked) {
    return { isValid: false, reason: "Token is blocked due to too many failed attempts" };
  }

  // Check if token has expired
  if (now > token.expiresAt) {
    return { isValid: false, reason: "Token has expired" };
  }

  // Check if token is in cooldown period
  if (token.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    const cooldownEndTime = new Date(token.lastAttemptAt!);
    cooldownEndTime.setMinutes(cooldownEndTime.getMinutes() + VERIFICATION_COOLDOWN_MINUTES);

    if (now < cooldownEndTime) {
      return {
        isValid: false,
        reason: `Too many attempts. Please try again after ${VERIFICATION_COOLDOWN_MINUTES} minutes`,
      };
    }

    // Reset attempts if cooldown period has passed
    token.verificationAttempts = 0;
    token.isBlocked = false;
    token.save();
  }

  return { isValid: true };
};

const tokenRepos = {
  createToken,
  findTokenByUserIdAndType,
  findTokenByVerificationToken,
  deleteTokenById,
  deleteTokensByUserId,
  recordVerificationAttempt,
  validateTokenForVerification,
  createRefreshToken,
  findRefreshTokenByUserId,
  validateRefreshToken,
  MAX_VERIFICATION_ATTEMPTS,
  VERIFICATION_COOLDOWN_MINUTES,
};

export default tokenRepos;
