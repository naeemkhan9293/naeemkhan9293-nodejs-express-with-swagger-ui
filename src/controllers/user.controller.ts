import { Request, Response } from "express";
import userRepos from "#src/repos/user.repos";
import tokenRepos from "#src/repos/token.repos";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "#src/error/AppError";
import ApiResponse from "#src/utils/ApiResponse";
import { generateMailOptions } from "#src/constants/mailOptions";
import { sendEmails } from "#src/services/sendEmail";
import { compareTokens, generateOtpToken } from "#src/utils/utils";
import { Types } from "mongoose";

const register = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (role === "admin" || role === "superadmin") {
      throw new UnauthorizedError("You are not authorized to create an admin account");
    }

    const existingUser = await userRepos.getUserByEmail(req.body.email);
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }

    const user = await userRepos.createUser(req.body);

    const otpObj = generateOtpToken();

    await tokenRepos.createToken(
      user._id as unknown as Types.ObjectId,
      otpObj.otp,
      "otp",
      otpObj.expiresAt
    );

    // Send OTP via email
    const mailOptions = await generateMailOptions("otp", user.email, {
      otpCode: otpObj.otp,
    });
    await sendEmails(mailOptions);

    return res
      .status(201)
      .json(
        ApiResponse.success(
          "Account created successfully. Please verify your account with the OTP sent to your email.",
          user,
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
 */
const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new BadRequestError("Email and OTP are required");
    }

    const user = await userRepos.getUserByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.verified) {
      return res.json(ApiResponse.success("Your account is already verified", { verified: true }));
    }

    const token = await tokenRepos.findTokenByUserIdAndType(
      user._id as unknown as Types.ObjectId,
      "otp"
    );

    if (!token) {
      throw new NotFoundError("OTP not found or expired. Please request a new OTP.");
    }

    if (new Date() > token.expiresAt) {
      await tokenRepos.deleteTokenById(token._id as unknown as Types.ObjectId);
      throw new BadRequestError("OTP has expired. Please request a new OTP.");
    }

    const isValid = await compareTokens(otp.toString(), token.tokenHash);
    if (!isValid) {
      throw new BadRequestError("Invalid OTP. Please try again.");
    }

    await userRepos.updateUser(user._id as unknown as Types.ObjectId, { verified: true });

    await tokenRepos.deleteTokenById(token._id as unknown as Types.ObjectId);

    return res.json(ApiResponse.success("Account verified successfully", { verified: true }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("An unknown error occurred");
  }
};

/**
 * Resend OTP to user's email
 */
const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const user = await userRepos.getUserByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.verified) {
      return res.json(ApiResponse.success("Your account is already verified", { verified: true }));
    }

    const existingToken = await tokenRepos.findTokenByUserIdAndType(
      user._id as unknown as Types.ObjectId,
      "otp"
    );

    if (existingToken) {
      await tokenRepos.deleteTokenById(existingToken._id as unknown as Types.ObjectId);
    }

    const otpObj = generateOtpToken();

    await tokenRepos.createToken(
      user._id as unknown as Types.ObjectId,
      otpObj.otp,
      "otp",
      otpObj.expiresAt
    );

    const mailOptions = await generateMailOptions("otp", user.email, {
      otpCode: otpObj.otp,
    });
    await sendEmails(mailOptions);

    return res.json(ApiResponse.success("OTP sent successfully. Please check your email."));
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("An unknown error occurred");
  }
};

const user = { register, verifyOtp, resendOtp };
export default user;
