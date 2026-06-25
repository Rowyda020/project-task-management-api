import { Request, Response } from "express";
import { mapPaginatedResult } from "../../common/dtos/pagination.dto";
import { getAccessContext } from "../../common/types/access-context";
import { AppError } from "../../common/filters/error.filter";
import { CreateTaskInput } from "../dtos/create-task.dto";
import { ListTasksQuery } from "../dtos/task-params.dto";
import { UpdateTaskInput } from "../dtos/update-task.dto";
import { Task } from "../models/task.entity";
import { taskService } from "../services/task.service";

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
      getAccessContext(req),
      getProjectId(req),
      req.body as CreateTaskInput,
    );
    res.status(201).json(toTaskResponse(task));
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const result = await taskService.findAllByProject(
      getAccessContext(req),
      getProjectId(req),
      req.query as unknown as ListTasksQuery,
    );
    res.status(200).json(mapPaginatedResult(result, toTaskResponse));
  }

  async findOne(req: Request, res: Response): Promise<void> {
    const task = await taskService.findOneByUser(
      getAccessContext(req),
      getProjectId(req),
      getTaskId(req),
    );
    res.status(200).json(toTaskResponse(task));
  }

  async update(req: Request, res: Response): Promise<void> {
    const task = await taskService.updateTask(
      getAccessContext(req),
      getProjectId(req),
      getTaskId(req),
      req.body as UpdateTaskInput,
    );
    res.status(200).json(toTaskResponse(task));
  }

  async delete(req: Request, res: Response): Promise<void> {
    await taskService.deleteTask(getAccessContext(req), getProjectId(req), getTaskId(req));
    res.status(204).send();
  }
}

export const taskController = new TaskController();
