import { dataSource } from "../../config/data-source";
import { User } from "../models/user.entity";

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export class UsersService {
  private readonly userRepository = dataSource.getRepository(User);

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(input: CreateUserInput): Promise<PublicUser> {
    const user = this.userRepository.create({
      name: input.name,
      email: input.email,
      password: input.passwordHash,
    });

    const saved = await this.userRepository.save(user);
    return toPublicUser(saved);
  }
}

export const usersService = new UsersService();
