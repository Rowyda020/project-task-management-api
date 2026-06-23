import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorFilter(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isDev = process.env.NODE_ENV !== "production";

  const message =
    err instanceof AppError
      ? err.message
      : err instanceof Error && isDev
        ? err.message
        : "Internal Server Error";

  res.status(statusCode).json({
    statusCode,
    message,
    ...(isDev && err instanceof Error && { stack: err.stack }),
  });
}
