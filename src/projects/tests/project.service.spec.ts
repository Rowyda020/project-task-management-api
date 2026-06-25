import { AppError } from "../../common/filters/error.filter";
import { dataSource } from "../../config/data-source";
import { ProjectStatus } from "../enums/project-status.enum";
import { ProjectService } from "../services/project.service";

jest.mock("../../config/data-source", () => {
  const sharedRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  return {
    dataSource: {
      getRepository: jest.fn(() => sharedRepo),
    },
  };
});

const mockRepository = (dataSource.getRepository as jest.Mock)();

describe("ProjectService", () => {
  const projectService = new ProjectService();
  const userId = "user-id";
  const projectId = "project-id";

  const createInput = {
    title: "Website Redesign",
    description: "Rebuild the company website",
    status: ProjectStatus.IN_PROGRESS,
  };

  const mockProject = {
    id: projectId,
    title: createInput.title,
    description: createInput.description,
    status: createInput.status,
    user: { id: userId },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("creates and saves a project for the user", async () => {
      mockRepository.create.mockReturnValue(mockProject);
      mockRepository.save.mockResolvedValue(mockProject);

      const result = await projectService.createProject(userId, createInput);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createInput,
        user: { id: userId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockProject);
      expect(result).toEqual(mockProject);
    });
  });

  describe("findAllByUserId", () => {
    it("returns all projects for the user", async () => {
      mockRepository.find.mockResolvedValue([mockProject]);

      const result = await projectService.findAllByUserId(userId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
      });
      expect(result).toEqual([mockProject]);
    });
  });

  describe("findOneByUserId", () => {
    it("returns the project when it belongs to the user", async () => {
      mockRepository.findOne.mockResolvedValue(mockProject);

      const result = await projectService.findOneByUserId(userId, projectId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: projectId, user: { id: userId } },
      });
      expect(result).toEqual(mockProject);
    });

    it("throws 404 when project is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(projectService.findOneByUserId(userId, projectId)).rejects.toEqual(
        new AppError(404, "Project not found"),
      );
    });
  });

  describe("updateProject", () => {
    it("updates only the provided fields", async () => {
      const existing = { ...mockProject };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockImplementation((project: typeof mockProject) =>
        Promise.resolve(project),
      );

      const result = await projectService.updateProject(userId, projectId, {
        title: "Updated Title",
      });

      expect(result.title).toBe("Updated Title");
      expect(result.description).toBe(createInput.description);
      expect(result.status).toBe(createInput.status);
      expect(mockRepository.save).toHaveBeenCalledWith(existing);
    });

    it("throws 404 when project is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        projectService.updateProject(userId, projectId, { title: "Updated Title" }),
      ).rejects.toEqual(new AppError(404, "Project not found"));
    });
  });

  describe("deleteProject", () => {
    it("removes the project when it belongs to the user", async () => {
      mockRepository.findOne.mockResolvedValue(mockProject);
      mockRepository.remove.mockResolvedValue(mockProject);

      await projectService.deleteProject(userId, projectId);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockProject);
    });

    it("throws 404 when project is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(projectService.deleteProject(userId, projectId)).rejects.toEqual(
        new AppError(404, "Project not found"),
      );

      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
