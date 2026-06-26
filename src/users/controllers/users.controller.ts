import { Request, Response } from "express";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "../../common/middleware/validated-request";
import { getAccessContext } from "../../common/types/access-context";
import { ListUsersQuery } from "../dtos/list-users-query.dto";
import { UpdateUserRoleInput, UserParams } from "../dtos/user-admin.dto";
import { usersService } from "../services/users.service";

function getUserId(req: Request): string {
  return getValidatedParams<UserParams>(req).id;
}

export class UsersController {
  async findAll(req: Request, res: Response): Promise<void> {
    const result = await usersService.findAll(getValidatedQuery<ListUsersQuery>(req));
    res.status(200).json(result);
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    const access = getAccessContext(req);
    const user = await usersService.updateRole(
      access.userId,
      getUserId(req),
      getValidatedBody<UpdateUserRoleInput>(req).role,
    );
    res.status(200).json(user);
  }
}

export const usersController = new UsersController();
