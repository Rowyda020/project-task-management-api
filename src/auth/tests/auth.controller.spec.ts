import { Request, Response } from "express";
import { UserRole } from "../../users/enums/user-role.enum";
import { AuthController } from "../controllers/auth.controller";
import { authService } from "../services/auth.service";

jest.mock("../services/auth.service", () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe("AuthController", () => {
  const authController = new AuthController();

  const mockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("returns 201 with the created user", async () => {
      const req = {
        body: {
          name: "test user",
          email: "test@gmail.com",
          password: "Password1!",
        },
      } as Request;
      const res = mockResponse();
      const createdUser = {
        id: "user-id",
        name: "test user",
        email: "test@gmail.com",
        role: UserRole.MEMBER,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      };

      mockedAuthService.register.mockResolvedValue(createdUser);

      await authController.register(req, res);

      expect(mockedAuthService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdUser);
    });
  });

  describe("login", () => {
    it("returns 200 with an access token", async () => {
      const req = {
        body: {
          email: "test@gmail.com",
          password: "Password1!",
        },
      } as Request;
      const res = mockResponse();
      const loginResult = { accessToken: "mock-access-token" };

      mockedAuthService.login.mockResolvedValue(loginResult);

      await authController.login(req, res);

      expect(mockedAuthService.login).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(loginResult);
    });
  });
});
