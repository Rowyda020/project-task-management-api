import { AppError } from "../../common/filters/error.filter";
import { dataSource } from "../../config/data-source";
import { projectService } from "../../projects/services/project.service";
import { TaskPriority } from "../enums/task-priority.enum";
import { TaskStatus } from "../enums/task-status.enum";
import { TaskService } from "../services/task.service";

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

jest.mock("../../projects/services/project.service", () => ({
  projectService: {
    findOneByUserId: jest.fn(),
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockedProjectService.findOneByUserId.mockResolvedValue({ id: projectId } as never);
  });

  describe("createTask", () => {
    it("creates a task under an owned project", async () => {
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await taskService.createTask(userId, projectId, createInput);

      expect(mockedProjectService.findOneByUserId).toHaveBeenCalledWith(userId, projectId);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createInput,
        project: { id: projectId },
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe("findAllByProject", () => {
    it("returns all tasks for a project", async () => {
      mockRepository.find.mockResolvedValue([mockTask]);

      const result = await taskService.findAllByProject(userId, projectId, {});

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { project: { id: projectId } },
      });
      expect(result).toEqual([mockTask]);
    });

    it("filters tasks by status and priority", async () => {
      mockRepository.find.mockResolvedValue([mockTask]);

      await taskService.findAllByProject(userId, projectId, {
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
      });

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          project: { id: projectId },
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
        },
      });
    });
  });

  describe("findOneByUser", () => {
    it("returns the task when it belongs to the user's project", async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await taskService.findOneByUser(userId, projectId, taskId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: taskId,
          project: { id: projectId, user: { id: userId } },
        },
      });
      expect(result).toEqual(mockTask);
    });

    it("throws 404 when task is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(taskService.findOneByUser(userId, projectId, taskId)).rejects.toEqual(
        new AppError(404, "Task not found"),
      );
    });
  });

  describe("updateTask", () => {
    it("updates only the provided fields", async () => {
      const existing = { ...mockTask };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockImplementation((task: typeof mockTask) => Promise.resolve(task));

      const result = await taskService.updateTask(userId, projectId, taskId, {
        status: TaskStatus.IN_PROGRESS,
      });

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.title).toBe(createInput.title);
    });

    it("throws 404 when task is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        taskService.updateTask(userId, projectId, taskId, { status: TaskStatus.DONE }),
      ).rejects.toEqual(new AppError(404, "Task not found"));
    });
  });

  describe("deleteTask", () => {
    it("removes the task when it belongs to the user's project", async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.remove.mockResolvedValue(mockTask);

      await taskService.deleteTask(userId, projectId, taskId);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it("throws 404 when task is not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(taskService.deleteTask(userId, projectId, taskId)).rejects.toEqual(
        new AppError(404, "Task not found"),
      );

      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
