import { Request, Response } from "express";
import { AppError } from "../../common/filters/error.filter";
import { ProjectController } from "../controllers/project.controller";
import { ProjectStatus } from "../enums/project-status.enum";
import { Project } from "../models/project.entity";
import { projectService } from "../services/project.service";

jest.mock("../services/project.service", () => ({
  projectService: {
    createProject: jest.fn(),
    findAllByUserId: jest.fn(),
    findOneByUserId: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  },
}));

const mockedProjectService = projectService as jest.Mocked<typeof projectService>;

describe("ProjectController", () => {
  const projectController = new ProjectController();
  const userId = "user-id";
  const projectId = "project-id";

  const mockProject = {
    id: projectId,
    title: "Website Redesign",
    description: "Rebuild the company website",
    status: ProjectStatus.IN_PROGRESS,
    user: { id: userId },
  } as Project;

  const projectResponse = {
    id: projectId,
    title: mockProject.title,
    description: mockProject.description,
    status: mockProject.status,
  };

  const mockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  const authedRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      user: { id: userId, email: "jane@example.com" },
      params: { id: projectId },
      body: {},
      ...overrides,
    }) as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("returns 201 with the created project", async () => {
      const req = authedRequest({
        body: {
          title: mockProject.title,
          description: mockProject.description,
          status: mockProject.status,
        },
      });
      const res = mockResponse();

      mockedProjectService.createProject.mockResolvedValue(mockProject);

      await projectController.create(req, res);

      expect(mockedProjectService.createProject).toHaveBeenCalledWith(userId, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(projectResponse);
    });

    it("throws 401 when user is not authenticated", async () => {
      const req = { body: {} } as Request;
      const res = mockResponse();

      await expect(projectController.create(req, res)).rejects.toEqual(
        new AppError(401, "Unauthorized"),
      );
    });
  });

  describe("findAll", () => {
    it("returns 200 with a list of projects", async () => {
      const req = authedRequest();
      const res = mockResponse();

      mockedProjectService.findAllByUserId.mockResolvedValue([mockProject]);

      await projectController.findAll(req, res);

      expect(mockedProjectService.findAllByUserId).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([projectResponse]);
    });
  });

  describe("findOne", () => {
    it("returns 200 with the project", async () => {
      const req = authedRequest();
      const res = mockResponse();

      mockedProjectService.findOneByUserId.mockResolvedValue(mockProject);

      await projectController.findOne(req, res);

      expect(mockedProjectService.findOneByUserId).toHaveBeenCalledWith(userId, projectId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(projectResponse);
    });
  });

  describe("update", () => {
    it("returns 200 with the updated project", async () => {
      const req = authedRequest({ body: { title: "Updated Title" } });
      const res = mockResponse();
      const updatedProject = { ...mockProject, title: "Updated Title" };

      mockedProjectService.updateProject.mockResolvedValue(updatedProject);

      await projectController.update(req, res);

      expect(mockedProjectService.updateProject).toHaveBeenCalledWith(
        userId,
        projectId,
        req.body,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ...projectResponse,
        title: "Updated Title",
      });
    });
  });

  describe("delete", () => {
    it("returns 204 with no body", async () => {
      const req = authedRequest();
      const res = mockResponse();

      mockedProjectService.deleteProject.mockResolvedValue(undefined);

      await projectController.delete(req, res);

      expect(mockedProjectService.deleteProject).toHaveBeenCalledWith(userId, projectId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
