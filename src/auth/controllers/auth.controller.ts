import { Request, Response } from "express";
import { getValidatedBody } from "../../common/middleware/validated-request";
import { LoginInput } from "../dtos/login.dto";
import { RegisterInput } from "../dtos/register.dto";
import { authService } from "../services/auth.service";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const user = await authService.register(getValidatedBody<RegisterInput>(req));
    res.status(201).json(user);
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(getValidatedBody<LoginInput>(req));
    res.status(200).json(result);
  }
}
export const authController = new AuthController();
