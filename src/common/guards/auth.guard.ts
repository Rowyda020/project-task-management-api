import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../filters/error.filter";

type AccessTokenPayload = {
  sub: string;
  email: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, requireEnv("JWT_SECRET")) as AccessTokenPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError(401, "Invalid or expired token"));
  }
}

const PUBLIC_PATH_PREFIXES = ["/health", "/auth", "/api-docs"];

export function requireAuthUnlessPublic(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const isPublic = PUBLIC_PATH_PREFIXES.some(
    (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`),
  );

  if (isPublic) {
    next();
    return;
  }

  authGuard(req, res, next);
}
