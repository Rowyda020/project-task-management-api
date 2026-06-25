import { Request, Response } from "express";
import { AppError } from "../../common/filters/error.filter";
import { TaskController } from "../controllers/task.controller";
import { TaskPriority } from "../enums/task-priority.enum";
import { TaskStatus } from "../enums/task-status.enum";
import { Task } from "../models/task.entity";
import { taskService } from "../services/task.service";

jest.mock("../services/task.service", () => ({
  taskService: {
    createTask: jest.fn(),
    findAllByProject: jest.fn(),
    findOneByUser: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

const mockedTaskService = taskService as jest.Mocked<typeof taskService>;

describe("TaskController", () => {
  const taskController = new TaskController();
  const userId = "user-id";
  const projectId = "project-id";
  const taskId = "task-id";

  const mockTask = {
    id: taskId,
    title: "Design homepage",
    description: "Create wireframes",
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2026-12-31T00:00:00.000Z"),
    project: { id: projectId },
  } as Task;

  const taskResponse = {
    id: taskId,
    title: mockTask.title,
    description: mockTask.description,
    status: mockTask.status,
    priority: mockTask.priority,
    dueDate: mockTask.dueDate,
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
      params: { projectId, taskId },
      query: {},
      body: {},
      ...overrides,
    }) as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("returns 201 with the created task", async () => {
      const req = authedRequest({
        body: {
          title: mockTask.title,
          description: mockTask.description,
          status: mockTask.status,
          priority: mockTask.priority,
          dueDate: mockTask.dueDate,
        },
      });
      const res = mockResponse();

      mockedTaskService.createTask.mockResolvedValue(mockTask);

      await taskController.create(req, res);

      expect(mockedTaskService.createTask).toHaveBeenCalledWith(userId, projectId, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(taskResponse);
    });
  });

  describe("findAll", () => {
    it("returns 200 with filtered tasks", async () => {
      const req = authedRequest({
        query: { status: TaskStatus.PENDING, priority: TaskPriority.HIGH },
      });
      const res = mockResponse();

      mockedTaskService.findAllByProject.mockResolvedValue([mockTask]);

      await taskController.findAll(req, res);

      expect(mockedTaskService.findAllByProject).toHaveBeenCalledWith(userId, projectId, req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([taskResponse]);
    });
  });

  describe("findOne", () => {
    it("returns 200 with the task", async () => {
      const req = authedRequest();
      const res = mockResponse();

      mockedTaskService.findOneByUser.mockResolvedValue(mockTask);

      await taskController.findOne(req, res);

      expect(mockedTaskService.findOneByUser).toHaveBeenCalledWith(userId, projectId, taskId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(taskResponse);
    });
  });

  describe("update", () => {
    it("returns 200 with the updated task", async () => {
      const req = authedRequest({ body: { status: TaskStatus.DONE } });
      const res = mockResponse();
      const updatedTask = { ...mockTask, status: TaskStatus.DONE };

      mockedTaskService.updateTask.mockResolvedValue(updatedTask);

      await taskController.update(req, res);

      expect(mockedTaskService.updateTask).toHaveBeenCalledWith(
        userId,
        projectId,
        taskId,
        req.body,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...taskResponse, status: TaskStatus.DONE });
    });
  });

  describe("delete", () => {
    it("returns 204 with no body", async () => {
      const req = authedRequest();
      const res = mockResponse();

      mockedTaskService.deleteTask.mockResolvedValue(undefined);

      await taskController.delete(req, res);

      expect(mockedTaskService.deleteTask).toHaveBeenCalledWith(userId, projectId, taskId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("throws 401 when user is not authenticated", async () => {
      const req = { params: { projectId, taskId } } as unknown as Request;
      const res = mockResponse();

      await expect(taskController.delete(req, res)).rejects.toEqual(
        new AppError(401, "Unauthorized"),
      );
    });
  });
});
