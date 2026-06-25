import { Request, Response } from "express";
import { LoginInput } from "../dto/login.dto";
import { RegisterInput } from "../dto/register.dto";
import { authService } from "../services/auth.service";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const body = req.body as RegisterInput;
    const user = await authService.register(body);
    res.status(201).json(user);
  }

  async login(req: Request, res: Response): Promise<void> {
    const body = req.body as LoginInput;
    const result = await authService.login(body);
    res.status(200).json(result);
  }
}

export const authController = new AuthController();
