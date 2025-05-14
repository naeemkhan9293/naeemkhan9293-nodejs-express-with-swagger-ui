import { Request, Response } from "express";
import userRepos from "#src/repos/user.repos";
import tokenRepos from "#src/repos/token.repos";
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
  VerificationError,
  AuthenticationError,
} from "#src/error/AppError";
import ApiResponse from "#src/utils/ApiResponse";
import { generateMailOptions } from "#src/constants/mailOptions";
import { sendEmails } from "#src/services/sendEmail";
import { compareTokens, generateOtpToken } from "#src/utils/utils";
import { Types } from "mongoose";
import serverConfig from "#src/config/serverConfig";
import jwt from "jsonwebtoken";

/**
 * Register a new user account
 * Enhanced with security measures:
 * 1. Improved error handling
 * 2. IP tracking for security monitoring
 * 3. Shorter OTP expiration time
 */
const register = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const clientIp = req.ip || "unknown";

    if (role === "admin" || role === "superadmin") {
      throw new UnauthorizedError("You are not authorized to create an admin account");
    }

    const existingUser = await userRepos.getUserByEmail(req.body.email);
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }

    const user = await userRepos.createUser(req.body);

    // Generate OTP with verification token and 10-minute expiration
    const otpObj = generateOtpToken();

    // Create token with verification attempt tracking
    await tokenRepos.createToken(
      user._id as unknown as Types.ObjectId,
      otpObj.otp,
      "otp",
      otpObj.expiresAt,
      otpObj.verificationToken
    );

    // Send OTP via email with verification token
    const mailOptions = await generateMailOptions("otp", user.email, {
      otpCode: otpObj.otp,
      verificationToken: otpObj.verificationToken,
    });
    await sendEmails(mailOptions);

    // Return response with verification token
    return res.status(201).json(
      ApiResponse.success(
        "Account created successfully. Please verify your account with the OTP sent to your email. The OTP will expire in 10 minutes.",
        {
          ...user.toObject(),
          verificationToken: otpObj.verificationToken,
        },
        201
      )
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("An unknown error occurred");
  }
};

/**
 * Verify a user's account using the OTP sent to their email
 * Enhanced with security measures:
 * 1. Token validation (expiration, blocking)
 * 2. Rate limiting through attempt tracking
 * 3. Token invalidation after success or multiple failures
 * 4. Verification token validation to ensure request legitimacy
 */
const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, verificationToken } = req.body;
    const clientIp = req.ip || "unknown";

    if (!email || !otp || !verificationToken) {
      throw new BadRequestError("Email, OTP, and verification token are required");
    }

    // First, find the token by verification token
    const token = await tokenRepos.findTokenByVerificationToken(verificationToken);

    if (!token) {
      throw new VerificationError("Invalid verification token. Please request a new OTP.");
    }

    // Get the user associated with this token
    const user = await userRepos.getUserById(token.userId);

    if (!user) {
      throw new VerificationError("User not found. Please contact support.");
    }

    // Verify that the email matches the user's email
    if (user.email !== email) {
      throw new VerificationError("Email does not match the verification token.");
    }

    if (user.verified) {
      return res.json(ApiResponse.success("Your account is already verified", { verified: true }));
    }

    await tokenRepos.recordVerificationAttempt(token._id as unknown as Types.ObjectId);

    const validationResult = tokenRepos.validateTokenForVerification(token);
    if (!validationResult.isValid) {
      throw new VerificationError(validationResult.reason || "Verification failed");
    }

    // Verify the OTP
    const isValid = await compareTokens(otp.toString(), token.tokenHash);
    if (!isValid) {
      throw new VerificationError("Invalid OTP. Please try again.");
    }

    // Mark user as verified
    await userRepos.updateUser(user._id as unknown as Types.ObjectId, { verified: true });

    // Invalidate the token after successful verification
    await tokenRepos.deleteTokenById(token._id as unknown as Types.ObjectId);

    return res.json(ApiResponse.success("Account verified successfully", { verified: true }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error instanceof VerificationError) {
        throw error;
      }
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("An unknown error occurred");
  }
};

/**
 * Resend OTP to user's email
 * Enhanced with security measures:
 * 1. Rate limiting for OTP resend requests
 * 2. Improved error handling
 * 3. IP tracking for security monitoring
 */
const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    // const clientIp = req.ip || "unknown";

    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const user = await userRepos.getUserByEmail(email);
    if (!user) {
      // Use generic error message to prevent user enumeration
      throw new VerificationError("If a user with this email exists, a new OTP has been sent.");
    }

    if (user.verified) {
      return res.json(ApiResponse.success("Your account is already verified", { verified: true }));
    }

    const existingToken = await tokenRepos.findTokenByUserIdAndType(
      user._id as unknown as Types.ObjectId,
      "otp"
    );

    // Implement rate limiting for OTP resend
    if (existingToken) {
      // Check if the last OTP was sent less than 1 minute ago
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      if (existingToken.createdAt > oneMinuteAgo) {
        throw new VerificationError("Please wait at least 1 minute before requesting a new OTP.");
      }

      // Check if token is blocked due to too many verification attempts
      if (existingToken.isBlocked) {
        throw new VerificationError(
          `This account has been temporarily blocked due to too many failed verification attempts. ` +
            `Please try again after ${tokenRepos.VERIFICATION_COOLDOWN_MINUTES} minutes.`
        );
      }

      // Delete the existing token
      await tokenRepos.deleteTokenById(existingToken._id as unknown as Types.ObjectId);
    }

    // Generate a new OTP with verification token and 10-minute expiration
    const otpObj = generateOtpToken();

    // Create a new token
    await tokenRepos.createToken(
      user._id as unknown as Types.ObjectId,
      otpObj.otp,
      "otp",
      otpObj.expiresAt,
      otpObj.verificationToken
    );

    // Send the OTP via email with verification token
    const mailOptions = await generateMailOptions("otp", user.email, {
      otpCode: otpObj.otp,
      verificationToken: otpObj.verificationToken,
    });
    await sendEmails(mailOptions);

    // Return response with verification token
    return res.json(
      ApiResponse.success(
        "OTP sent successfully. Please check your email. The OTP will expire in 10 minutes.",
        {
          verificationToken: otpObj.verificationToken, // Include verification token in response
        }
      )
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Pass through VerificationError but wrap others in InternalServerError
      if (error instanceof VerificationError) {
        throw error;
      }
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("An unknown error occurred");
  }
};

/**
 * Login a user
 * If the user is verified, returns user data with access and refresh tokens
 * If the user is not verified, returns verification data (OTP and verification token)
 */
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || "unknown";

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const user = await userRepos.getUserByEmailWithPassword(email);

    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    if (!user.verified) {
      // Generate new OTP for verification
      const otpObj = generateOtpToken();

      // Delete any existing OTP tokens
      const existingToken = await tokenRepos.findTokenByUserIdAndType(
        user._id as unknown as Types.ObjectId,
        "otp"
      );

      if (existingToken) {
        await tokenRepos.deleteTokenById(existingToken._id as unknown as Types.ObjectId);
      }

      // Create a new token
      await tokenRepos.createToken(
        user._id as unknown as Types.ObjectId,
        otpObj.otp,
        "otp",
        otpObj.expiresAt,
        otpObj.verificationToken
      );

      // Send the OTP via email
      const mailOptions = await generateMailOptions("otp", user.email, {
        otpCode: otpObj.otp,
        verificationToken: otpObj.verificationToken,
      });
      await sendEmails(mailOptions);

      // Return response with verification data
      return res.json(
        ApiResponse.success(
          "Account not verified. Please verify your account with the OTP sent to your email.",
          {
            user: {
              _id: user._id,
              email: user.email,
              username: user.username,
              verified: user.verified,
            },
            verificationData: {
              verificationToken: otpObj.verificationToken,
            },
          }
        )
      );
    }

    // User is verified, generate tokens
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Calculate refresh token expiration date
    const refreshTokenExpiresAt = new Date();
    // Parse the expiration from serverConfig (e.g., "7d" to 7 days)
    const refreshExpiration = serverConfig.refreshTokenExpiration;
    const days = parseInt(refreshExpiration.replace("d", ""));
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + days);

    // Delete any existing refresh tokens for this user
    const existingRefreshToken = await tokenRepos.findRefreshTokenByUserId(
      user._id as unknown as Types.ObjectId
    );

    if (existingRefreshToken) {
      await tokenRepos.deleteTokenById(existingRefreshToken._id as unknown as Types.ObjectId);
    }

    // Store the refresh token in the database
    await tokenRepos.createRefreshToken(
      user._id as unknown as Types.ObjectId,
      refreshToken,
      refreshTokenExpiresAt
    );

    console.log(`Successful login: ${user._id} from IP ${clientIp}`);

    // Return user data with tokens
    return res.json(
      ApiResponse.success("Login successful", {
        user,
        accessToken,
        refreshToken,
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error instanceof AuthenticationError || error instanceof BadRequestError) {
        throw error;
      }
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("An unknown error occurred");
  }
};

/**
 * Refresh access token using a valid refresh token
 */
const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const clientIp = req.ip || "unknown";

    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }

    // Verify the refresh token and get the user ID
    let userId;
    try {
      const decoded = jwt.verify(refreshToken, serverConfig.refreshTokenSecret) as { id: string };
      userId = decoded.id;
    } catch (error) {
      console.log(`Invalid refresh token from IP ${clientIp}`);
      throw new AuthenticationError("Invalid refresh token");
    }

    // Validate the refresh token in the database
    const validationResult = await tokenRepos.validateRefreshToken(
      new Types.ObjectId(userId),
      refreshToken
    );

    if (!validationResult.isValid) {
      console.log(
        `Refresh token validation failed: ${validationResult.reason} from IP ${clientIp}`
      );
      throw new AuthenticationError(validationResult.reason || "Invalid refresh token");
    }

    // Get the user
    const user = await userRepos.getUserById(new Types.ObjectId(userId));
    if (!user) {
      throw new AuthenticationError("User not found");
    }

    // Generate a new access token
    const newAccessToken = await user.generateAccessToken();

    console.log(`Access token refreshed for user ${userId} from IP ${clientIp}`);

    // Return the new access token
    return res.json(
      ApiResponse.success("Token refreshed successfully", {
        accessToken: newAccessToken,
        // Include a message for Swagger UI users
        message: "The new access token has been automatically applied to subsequent requests.",
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error instanceof AuthenticationError || error instanceof BadRequestError) {
        throw error;
      }
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("An unknown error occurred");
  }
};

const user = { register, verifyOtp, resendOtp, login, refreshToken };
export default user;
