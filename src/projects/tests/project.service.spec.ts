import { AppError } from "../../common/filters/error.filter";
import { AccessContext } from "../../common/types/access-context";
import { dataSource } from "../../config/data-source";
import { UserRole } from "../../users/enums/user-role.enum";
import { ProjectStatus } from "../enums/project-status.enum";
import { ProjectService } from "../services/project.service";

jest.mock("../../config/data-source", () => {
  const sharedRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
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
  const memberAccess: AccessContext = { userId, role: UserRole.MEMBER };
  const adminAccess: AccessContext = { userId: "admin-id", role: UserRole.ADMIN };

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

  const defaultQuery = {
    page: 1,
    limit: 10,
    sortBy: "title" as const,
    sortOrder: "asc" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("creates and saves a project for the user", async () => {
      mockRepository.create.mockReturnValue(mockProject);
      mockRepository.save.mockResolvedValue(mockProject);

      const result = await projectService.createProject(memberAccess, createInput);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createInput,
        user: { id: userId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockProject);
      expect(result).toEqual(mockProject);
    });
  });

  describe("findAll", () => {
    it("returns paginated projects for a member", async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockProject], 1]);

      const result = await projectService.findAll(memberAccess, defaultQuery);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        skip: 0,
        take: 10,
        order: { title: "ASC" },
      });
      expect(result).toEqual({
        data: [mockProject],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    });

    it("returns all projects for an admin", async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockProject], 1]);

      await projectService.findAll(adminAccess, defaultQuery);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { title: "ASC" },
      });
    });
  });

  describe("findOne", () => {
    it("returns the project when it belongs to the member", async () => {
      mockRepository.findOne.mockResolvedValue(mockProject);

      const result = await projectService.findOne(memberAccess, projectId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: projectId, user: { id: userId } },
      });
      expect(result).toEqual(mockProject);
    });

    it("returns any project for an admin", async () => {
      mockRepository.findOne.mockResolvedValue(mockProject);

      await projectService.findOne(adminAccess, projectId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: projectId },
      });
    });

    it("throws 404 when project is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(projectService.findOne(memberAccess, projectId)).rejects.toEqual(
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

      const result = await projectService.updateProject(memberAccess, projectId, {
        title: "Updated Title",
      });

      expect(result.title).toBe("Updated Title");
      expect(mockRepository.save).toHaveBeenCalledWith(existing);
    });
  });

  describe("deleteProject", () => {
    it("removes the project when accessible", async () => {
      mockRepository.findOne.mockResolvedValue(mockProject);
      mockRepository.remove.mockResolvedValue(mockProject);

      await projectService.deleteProject(memberAccess, projectId);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockProject);
    });
  });
});
