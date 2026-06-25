import { AppError } from "../../common/filters/error.filter";
import { dataSource } from "../../config/data-source";
import { UserRole } from "../enums/user-role.enum";
import { UsersService } from "../services/users.service";

jest.mock("../../config/data-source", () => {
  const sharedRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  return {
    dataSource: {
      getRepository: jest.fn(() => sharedRepo),
    },
  };
});

const mockRepository = (dataSource.getRepository as jest.Mock)();

describe("UsersService", () => {
  const usersService = new UsersService();
  const adminId = "admin-id";
  const memberId = "member-id";

  const mockUser = {
    id: memberId,
    name: "Jane Doe",
    email: "jane@example.com",
    password: "hashed-password",
    role: UserRole.MEMBER,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    projects: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates a user with member role by default", async () => {
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await usersService.create({
        name: mockUser.name,
        email: mockUser.email,
        passwordHash: mockUser.password,
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
        role: UserRole.MEMBER,
      });
      expect(result.role).toBe(UserRole.MEMBER);
    });
  });

  describe("updateRole", () => {
    it("updates another user's role", async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockImplementation((user: typeof mockUser) => Promise.resolve(user));

      const result = await usersService.updateRole(adminId, memberId, UserRole.ADMIN);

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it("throws 400 when admin tries to change own role", async () => {
      await expect(usersService.updateRole(adminId, adminId, UserRole.MEMBER)).rejects.toEqual(
        new AppError(400, "You cannot change your own role"),
      );
    });

    it("throws 404 when user is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(usersService.updateRole(adminId, memberId, UserRole.ADMIN)).rejects.toEqual(
        new AppError(404, "User not found"),
      );
    });
  });
});
