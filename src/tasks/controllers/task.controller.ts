import { Request, Response } from "express";
import { mapPaginatedResult } from "../../common/dtos/pagination.dto";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "../../common/middleware/validated-request";
import { getAccessContext } from "../../common/types/access-context";
import { CreateTaskInput } from "../dtos/create-task.dto";
import {
  ListTasksQuery,
  TaskParams,
  TaskProjectParams,
} from "../dtos/task-params.dto";
import { UpdateTaskInput } from "../dtos/update-task.dto";
import { Task } from "../models/task.entity";
import { taskService } from "../services/task.service";

function getProjectId(req: Request): string {
  return getValidatedParams<TaskProjectParams | TaskParams>(req).projectId;
}

function getTaskId(req: Request): string {
  return getValidatedParams<TaskParams>(req).taskId;
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
      getValidatedBody<CreateTaskInput>(req),
    );
    res.status(201).json(toTaskResponse(task));
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const result = await taskService.findAllByProject(
      getAccessContext(req),
      getProjectId(req),
      getValidatedQuery<ListTasksQuery>(req),
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
      getValidatedBody<UpdateTaskInput>(req),
    );
    res.status(200).json(toTaskResponse(task));
  }

  async delete(req: Request, res: Response): Promise<void> {
    await taskService.deleteTask(getAccessContext(req), getProjectId(req), getTaskId(req));
    res.status(204).send();
  }
}

export const taskController = new TaskController();
