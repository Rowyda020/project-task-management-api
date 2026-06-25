import { Request, Response } from "express";
import { AppError } from "../../common/filters/error.filter";
import { CreateTaskInput } from "../dtos/create-task.dto";
import { ListTasksQuery } from "../dtos/task-params.dto";
import { UpdateTaskInput } from "../dtos/update-task.dto";
import { Task } from "../models/task.entity";
import { taskService } from "../services/task.service";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new AppError(401, "Unauthorized");
  }
  return req.user.id;
}

function getProjectId(req: Request): string {
  const { projectId } = req.params;
  if (typeof projectId !== "string") {
    throw new AppError(400, "Project id must be a valid UUID");
  }
  return projectId;
}

function getTaskId(req: Request): string {
  const { taskId } = req.params;
  if (typeof taskId !== "string") {
    throw new AppError(400, "Task id must be a valid UUID");
  }
  return taskId;
}

function toTaskResponse(task: Task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
  };
}

export class TaskController {
  async create(req: Request, res: Response): Promise<void> {
    const task = await taskService.createTask(
      getUserId(req),
      getProjectId(req),
      req.body as CreateTaskInput,
    );
    res.status(201).json(toTaskResponse(task));
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const tasks = await taskService.findAllByProject(
      getUserId(req),
      getProjectId(req),
      req.query as ListTasksQuery,
    );
    res.status(200).json(tasks.map(toTaskResponse));
  }

  async findOne(req: Request, res: Response): Promise<void> {
    const task = await taskService.findOneByUser(
      getUserId(req),
      getProjectId(req),
      getTaskId(req),
    );
    res.status(200).json(toTaskResponse(task));
  }

  async update(req: Request, res: Response): Promise<void> {
    const task = await taskService.updateTask(
      getUserId(req),
      getProjectId(req),
      getTaskId(req),
      req.body as UpdateTaskInput,
    );
    res.status(200).json(toTaskResponse(task));
  }

  async delete(req: Request, res: Response): Promise<void> {
    await taskService.deleteTask(getUserId(req), getProjectId(req), getTaskId(req));
    res.status(204).send();
  }
}

export const taskController = new TaskController();
