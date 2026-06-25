import { dataSource } from "../../config/data-source";
import { createPaginatedResult, PaginatedResult, toFindOptions } from "../../common/dtos/pagination.dto";
import { AppError } from "../../common/filters/error.filter";
import { UserRole } from "../enums/user-role.enum";
import { User } from "../models/user.entity";
import { ListUsersQuery } from "../dtos/list-users-query.dto";

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export class UsersService {
  private readonly userRepository = dataSource.getRepository(User);

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(input: CreateUserInput): Promise<PublicUser> {
    const user = this.userRepository.create({
      name: input.name,
      email: input.email,
      password: input.passwordHash,
      role: input.role ?? UserRole.MEMBER,
    });

    const saved = await this.userRepository.save(user);
    return toPublicUser(saved);
  }

  async findAll(query: ListUsersQuery): Promise<PaginatedResult<PublicUser>> {
    const { page, limit, sortBy, sortOrder } = query;

    const [users, total] = await this.userRepository.findAndCount({
      ...toFindOptions(page, limit, sortBy, sortOrder),
    });

    return createPaginatedResult(users.map(toPublicUser), total, page, limit);
  }

  async updateRole(
    actorId: string,
    userId: string,
    role: UserRole,
  ): Promise<PublicUser> {
    if (actorId === userId) {
      throw new AppError(400, "You cannot change your own role");
    }

    const user = await this.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    user.role = role;
    const saved = await this.userRepository.save(user);
    return toPublicUser(saved);
  }
}

export const usersService = new UsersService();
