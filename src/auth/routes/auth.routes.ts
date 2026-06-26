import { Router } from "express";
import { asyncHandler } from "../../common/middleware/async-handler";
import { validate } from "../../common/middleware/validate";
import { authController } from "../controllers/auth.controller";
import { loginRateLimiter, registerRateLimiter } from "../../common/middleware/rate-limit";
import { loginSchema } from "../dtos/login.dto";
import { registerSchema } from "../dtos/register.dto";

const authRoutes = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       429:
 *         description: Too many registration attempts
 */
authRoutes.post(
  "/register",
  registerRateLimiter,
  validate(registerSchema),
  asyncHandler((req, res) => authController.register(req, res)),
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       429:
 *         description: Too many login attempts
 */
authRoutes.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res)),
);

export default authRoutes;
