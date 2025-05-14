import user from "#src/controllers/user.controller";
import asyncHandler from "#src/utils/asyncHandler";
import express from "express";
const router = express.Router();

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Creates a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/register", asyncHandler(user.register));

/**
 * @openapi
 * /api/users/verify-otp:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verify user account with OTP
 *     description: Verifies a user account using the OTP sent to their email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtp'
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OtpResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found or OTP expired
 *       500:
 *         description: Internal server error
 */
router.post("/verify-otp", asyncHandler(user.verifyOtp));

/**
 * @openapi
 * /api/users/resend-otp:
 *   post:
 *     tags:
 *       - Users
 *     summary: Resend OTP
 *     description: Resends the OTP to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtp'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OtpResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/resend-otp", asyncHandler(user.resendOtp));

export default router;
