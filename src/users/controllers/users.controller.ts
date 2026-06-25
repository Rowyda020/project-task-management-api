import { Request, Response } from "express";
import { getAccessContext } from "../../common/types/access-context";
import { AppError } from "../../common/filters/error.filter";
import { ListUsersQuery } from "../dtos/list-users-query.dto";
import { UpdateUserRoleInput } from "../dtos/user-admin.dto";
import { usersService } from "../services/users.service";

function getUserId(req: Request): string {
  const { id } = req.params;
  if (typeof id !== "string") {
    throw new AppError(400, "User id must be a valid UUID");
  }
  return id;
}

export class UsersController {
  async findAll(req: Request, res: Response): Promise<void> {
    const result = await usersService.findAll(req.query as unknown as ListUsersQuery);
    res.status(200).json(result);
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    const access = getAccessContext(req);
    const user = await usersService.updateRole(
      access.userId,
      getUserId(req),
      (req.body as UpdateUserRoleInput).role,
    );
    res.status(200).json(user);
  }
}

export const usersController = new UsersController();
