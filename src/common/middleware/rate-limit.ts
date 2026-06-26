import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

const rateLimitMessage = "Too many requests, please try again later";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createAuthRateLimiter(options: {
  envMaxKey: string;
  envWindowKey: string;
  defaultMax: number;
  defaultWindowMs: number;
  skipSuccessfulRequests?: boolean;
}) {
  return rateLimit({
    windowMs: parsePositiveInt(process.env[options.envWindowKey], options.defaultWindowMs),
    max: parsePositiveInt(process.env[options.envMaxKey], options.defaultMax),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    skip: () => process.env.NODE_ENV === "test",
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        statusCode: 429,
        message: rateLimitMessage,
      });
    },
  });
}

export const loginRateLimiter = createAuthRateLimiter({
  envMaxKey: "AUTH_LOGIN_RATE_LIMIT_MAX",
  envWindowKey: "AUTH_LOGIN_RATE_LIMIT_WINDOW_MS",
  defaultMax: 10,
  defaultWindowMs: 15 * 60 * 1000,
  skipSuccessfulRequests: true,
});

export const registerRateLimiter = createAuthRateLimiter({
  envMaxKey: "AUTH_REGISTER_RATE_LIMIT_MAX",
  envWindowKey: "AUTH_REGISTER_RATE_LIMIT_WINDOW_MS",
  defaultMax: 5,
  defaultWindowMs: 60 * 60 * 1000,
});
