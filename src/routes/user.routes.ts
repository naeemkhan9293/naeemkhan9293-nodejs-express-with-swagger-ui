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

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login user
 *     description: |
 *       Authenticates a user and returns tokens if verified, or verification data if not verified.
 *
 *       When using Swagger UI, the access token will be automatically applied to subsequent requests
 *       after successful login. You don't need to manually copy and paste the token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login successful or verification required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 *     x-swagger-router-controller: "user"
 */
router.post("/login", asyncHandler(user.login));

/**
 * @openapi
 * /api/users/refresh-token:
 *   post:
 *     tags:
 *       - Users
 *     summary: Refresh access token
 *     description: |
 *       Generates a new access token using a valid refresh token.
 *
 *       When using Swagger UI, the new access token will be automatically applied to subsequent requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshToken'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 *     x-swagger-router-controller: "user"
 */
router.post("/refresh-token", asyncHandler(user.refreshToken));

export default router;
