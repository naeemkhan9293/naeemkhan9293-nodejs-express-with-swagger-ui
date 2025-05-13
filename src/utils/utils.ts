import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Generates a secure random token.
 * @returns {string} A 32-byte random string converted to hex.
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hashes a plain token using bcrypt.
 * @param {string} token - The plain token to be hashed.
 * @returns {Promise<string>} A promise that resolves to the hashed token.
 */
export const hashToken = async (token: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(token, saltRounds);
};

/**
 * Compares a plain token with a hashed token.
 * @param {string} plainToken - The plain token to compare.
 * @param {string} hashedToken - The hashed token to compare against.
 * @returns {Promise<boolean>} A promise that resolves to true if the tokens match, false otherwise.
 */
export const compareTokens = async (plainToken: string, hashedToken: string): Promise<boolean> => {
  return bcrypt.compare(plainToken, hashedToken);
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const generateOtpToken = () => {
  const otp = generateOtp();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);
  return { otp, expiresAt };
};

generateOtpToken();
