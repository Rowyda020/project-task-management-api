import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { AppError } from "../../common/filters/error.filter";
import { requireEnv } from "../../common/utils/require-env";
import { UserRole } from "../../users/enums/user-role.enum";
import { usersService } from "../../users/services/users.service";
import { LoginInput } from "../dtos/login.dto";
import { RegisterInput } from "../dtos/register.dto";

function getSaltRounds(): number {
  return parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
}

function getRegistrationRole(email: string): UserRole {
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  if (bootstrapEmail && email.toLowerCase() === bootstrapEmail.toLowerCase()) {
    return UserRole.ADMIN;
  }
  return UserRole.MEMBER;
}

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await usersService.findByEmail(input.email);
    if (existingUser) {
      throw new AppError(409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, getSaltRounds());
    const user = await usersService.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: getRegistrationRole(input.email),
    });

    return user;
  }

  async login(input: LoginInput) {
    const user = await usersService.findByEmail(input.email);
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"],
    };

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      requireEnv("JWT_SECRET"),
      signOptions,
    );

    return { accessToken };
  }
}

export const authService = new AuthService();
