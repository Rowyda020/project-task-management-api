import { AppError } from "../../common/filters/error.filter";
import { AccessContext } from "../../common/types/access-context";
import { dataSource } from "../../config/data-source";
import { projectService } from "../../projects/services/project.service";
import { UserRole } from "../../users/enums/user-role.enum";
import { TaskPriority } from "../enums/task-priority.enum";
import { TaskStatus } from "../enums/task-status.enum";
import { TaskService } from "../services/task.service";

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

jest.mock("../../projects/services/project.service", () => ({
  projectService: {
    findOne: jest.fn(),
  },
}));

import { dataSource as mockedDataSource } from "../../config/data-source";

const mockRepository = (mockedDataSource.getRepository as jest.Mock)();
const mockedProjectService = projectService as jest.Mocked<typeof projectService>;

describe("TaskService", () => {
  const taskService = new TaskService();
  const userId = "user-id";
  const projectId = "project-id";
  const taskId = "task-id";
  const memberAccess: AccessContext = { userId, role: UserRole.MEMBER };
  const adminAccess: AccessContext = { userId: "admin-id", role: UserRole.ADMIN };

  const createInput = {
    title: "Design homepage",
    description: "Create wireframes",
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2026-12-31T00:00:00.000Z"),
  };

  const mockTask = {
    id: taskId,
    ...createInput,
    project: { id: projectId },
  };

  const defaultQuery = {
    page: 1,
    limit: 10,
    sortBy: "dueDate" as const,
    sortOrder: "asc" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedProjectService.findOne.mockResolvedValue({ id: projectId } as never);
  });

  describe("createTask", () => {
    it("creates a task under an accessible project", async () => {
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await taskService.createTask(memberAccess, projectId, createInput);

      expect(mockedProjectService.findOne).toHaveBeenCalledWith(memberAccess, projectId);
      expect(result).toEqual(mockTask);
    });
  });

  describe("findAllByProject", () => {
    it("returns paginated tasks for a project", async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockTask], 1]);

      const result = await taskService.findAllByProject(memberAccess, projectId, defaultQuery);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { project: { id: projectId } },
        skip: 0,
        take: 10,
        order: { dueDate: "ASC" },
      });
      expect(result.data).toEqual([mockTask]);
    });
  });

  describe("findOneByUser", () => {
    it("returns the task when it belongs to the member's project", async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await taskService.findOneByUser(memberAccess, projectId, taskId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: taskId,
          project: { id: projectId, user: { id: userId } },
        },
      });
      expect(result).toEqual(mockTask);
    });

    it("returns any task in the project for an admin", async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      await taskService.findOneByUser(adminAccess, projectId, taskId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: taskId,
          project: { id: projectId },
        },
      });
    });

    it("throws 404 when task is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(taskService.findOneByUser(memberAccess, projectId, taskId)).rejects.toEqual(
        new AppError(404, "Task not found"),
      );
    });
  });

  describe("updateTask", () => {
    it("updates only the provided fields", async () => {
      const existing = { ...mockTask };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockImplementation((task: typeof mockTask) => Promise.resolve(task));

      const result = await taskService.updateTask(memberAccess, projectId, taskId, {
        status: TaskStatus.IN_PROGRESS,
      });

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe("deleteTask", () => {
    it("removes the task when accessible", async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.remove.mockResolvedValue(mockTask);

      await taskService.deleteTask(memberAccess, projectId, taskId);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    });
  });
});
