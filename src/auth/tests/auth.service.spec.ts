import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../common/filters/error.filter";
import { usersService } from "../../users/services/users.service";
import { AuthService } from "./auth.service";

jest.mock("../../users/services/users.service", () => ({
  usersService: {
    findByEmail: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const mockedUsersService = usersService as jest.Mocked<typeof usersService>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("AuthService", () => {
  const authService = new AuthService();

  const registerInput = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "Password1!",
  };

  const loginInput = {
    email: "jane@example.com",
    password: "Password1!",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1d";
    process.env.BCRYPT_SALT_ROUNDS = "10";
  });

  describe("register", () => {
    it("creates a user when email is not taken", async () => {
      const createdUser = {
        id: "user-id",
        name: registerInput.name,
        email: registerInput.email,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      };

      mockedUsersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue("hashed-password" as never);
      mockedUsersService.create.mockResolvedValue(createdUser);

      const result = await authService.register(registerInput);

      expect(mockedUsersService.findByEmail).toHaveBeenCalledWith(registerInput.email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerInput.password, 10);
      expect(mockedUsersService.create).toHaveBeenCalledWith({
        name: registerInput.name,
        email: registerInput.email,
        passwordHash: "hashed-password",
      });
      expect(result).toEqual(createdUser);
    });

    it("throws 409 when email is already registered", async () => {
      mockedUsersService.findByEmail.mockResolvedValue({
        id: "existing-id",
        name: "Existing User",
        email: registerInput.email,
        password: "hashed-password",
        createdAt: new Date(),
      });

      await expect(authService.register(registerInput)).rejects.toEqual(
        new AppError(409, "Email is already registered"),
      );

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(mockedUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const storedUser = {
      id: "user-id",
      name: "Jane Doe",
      email: loginInput.email,
      password: "hashed-password",
      createdAt: new Date(),
    };

    it("returns an access token for valid credentials", async () => {
      mockedUsersService.findByEmail.mockResolvedValue(storedUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign.mockReturnValue("mock-access-token" as never);

      const result = await authService.login(loginInput);

      expect(mockedUsersService.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        storedUser.password,
      );
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { sub: storedUser.id, email: storedUser.email },
        "test-secret",
        { expiresIn: "1d" },
      );
      expect(result).toEqual({ accessToken: "mock-access-token" });
    });

    it("throws 401 when user is not found", async () => {
      mockedUsersService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toEqual(
        new AppError(401, "Invalid email or password"),
      );

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(mockedJwt.sign).not.toHaveBeenCalled();
    });

    it("throws 401 when password is invalid", async () => {
      mockedUsersService.findByEmail.mockResolvedValue(storedUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.login(loginInput)).rejects.toEqual(
        new AppError(401, "Invalid email or password"),
      );

      expect(mockedJwt.sign).not.toHaveBeenCalled();
    });
  });
});
