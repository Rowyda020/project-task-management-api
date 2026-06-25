import { NextFunction, Request, Response } from "express";
import { AppError } from "../filters/error.filter";
import { rolesGuard } from "./roles.guard";
import { UserRole } from "../../users/enums/user-role.enum";

describe("rolesGuard", () => {
  const next = jest.fn() as NextFunction;
  const res = {} as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows access when user has an allowed role", () => {
    const req = { user: { id: "user-id", email: "a@b.com", role: UserRole.ADMIN } } as Request;

    rolesGuard(UserRole.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("denies access when user role is not allowed", () => {
    const req = { user: { id: "user-id", email: "a@b.com", role: UserRole.MEMBER } } as Request;

    rolesGuard(UserRole.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith(new AppError(403, "Forbidden"));
  });

  it("denies access when user is missing", () => {
    const req = {} as Request;

    rolesGuard(UserRole.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith(new AppError(403, "Forbidden"));
  });
});
