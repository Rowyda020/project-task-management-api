import { NextFunction, Request, Response } from "express";
import { AppError } from "../filters/error.filter";
import { UserRole } from "../../users/enums/user-role.enum";

export function rolesGuard(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      next(new AppError(403, "Forbidden"));
      return;
    }

    next();
  };
}
