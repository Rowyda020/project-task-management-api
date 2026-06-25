import { Request } from "express";
import { AppError } from "../filters/error.filter";
import { UserRole } from "../../users/enums/user-role.enum";

export type AccessContext = {
  userId: string;
  role: UserRole;
};

export function isAdmin(access: AccessContext): boolean {
  return access.role === UserRole.ADMIN;
}

export function getAccessContext(req: Request): AccessContext {
  if (!req.user?.id || !req.user?.role) {
    throw new AppError(401, "Unauthorized");
  }

  return {
    userId: req.user.id,
    role: req.user.role,
  };
}
