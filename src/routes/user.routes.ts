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

export default router;
