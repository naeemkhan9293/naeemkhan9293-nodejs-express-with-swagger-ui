import { Request, Response } from "express";
import userRepos from "#src/repos/user.repos";
import { InternalServerError, UnauthorizedError } from "#src/error/AppError";
import ApiResponse from "#src/utils/ApiResponse";
import { generateMailOptions } from "#src/constants/mailOptions";
import { sendEmails } from "#src/services/sendEmail";
import { generateOtpToken } from "#src/utils/utils";

const register = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (role === "admin" || role === "superadmin") {
      throw new UnauthorizedError("You are not authorized to create an admin account");
    }
    const user = await userRepos.createUser(req.body);
    res
      .status(201)
      .json(
        ApiResponse.success(
          "Account created successfully Please verify your account to continue",
          user,
          201
        )
      );
    const otpObj = generateOtpToken();
    const mailOptions = await generateMailOptions("otp", user.email, {
      otpCode: otpObj.otp,
    });

    await sendEmails(mailOptions);

    return;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("An unknown error occurred");
  }
};

const user = { register };
export default user;
