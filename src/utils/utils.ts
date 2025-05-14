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

/**
 * Generates a short verification token for use in URLs
 * @returns A 12-character random string
 */
export const generateShortVerificationToken = (): string => {
  return crypto.randomBytes(6).toString("hex");
};

/**
 * Generates an OTP token with a 10-minute expiration time
 * @returns An object containing the OTP, verification token, and expiration date
 */
export const generateOtpToken = () => {
  const otp = generateOtp();
  const verificationToken = generateShortVerificationToken();
  const expiresAt = new Date();
  // 10-minute expiration for better security
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  return { otp, verificationToken, expiresAt };
};
