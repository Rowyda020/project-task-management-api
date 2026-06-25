import { FindOptionsWhere } from "typeorm";
import { AppError } from "../../common/filters/error.filter";
import { createPaginatedResult, PaginatedResult, toFindOptions } from "../../common/dtos/pagination.dto";
import { AccessContext, isAdmin } from "../../common/types/access-context";
import { dataSource } from "../../config/data-source";
import { projectService } from "../../projects/services/project.service";
import { CreateTaskInput } from "../dtos/create-task.dto";
import { ListTasksQuery } from "../dtos/task-params.dto";
import { UpdateTaskInput } from "../dtos/update-task.dto";
import { Task } from "../models/task.entity";

export class TaskService {
  private readonly taskRepo = dataSource.getRepository(Task);

  async createTask(
    access: AccessContext,
    projectId: string,
    input: CreateTaskInput,
  ): Promise<Task> {
    await projectService.findOne(access, projectId);

    const task = this.taskRepo.create({
      ...input,
      project: { id: projectId },
    });

    return this.taskRepo.save(task);
  }

  async findAllByProject(
    access: AccessContext,
    projectId: string,
    query: ListTasksQuery,
  ): Promise<PaginatedResult<Task>> {
    await projectService.findOne(access, projectId);

    const { page, limit, sortBy, sortOrder } = query;

    const where: FindOptionsWhere<Task> = {
      project: { id: projectId },
    };

    if (query.status !== undefined) {
      where.status = query.status;
    }

    if (query.priority !== undefined) {
      where.priority = query.priority;
    }

    const [data, total] = await this.taskRepo.findAndCount({
      where,
      ...toFindOptions(page, limit, sortBy, sortOrder),
    });

    return createPaginatedResult(data, total, page, limit);
  }

  async findOneByUser(
    access: AccessContext,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    return this.findAccessibleTask(access, projectId, taskId);
  }

  async updateTask(
    access: AccessContext,
    projectId: string,
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<Task> {
    const task = await this.findAccessibleTask(access, projectId, taskId);

    if (input.title !== undefined) {
      task.title = input.title;
    }
    if (input.description !== undefined) {
      task.description = input.description;
    }
    if (input.status !== undefined) {
      task.status = input.status;
    }
    if (input.priority !== undefined) {
      task.priority = input.priority;
    }
    if (input.dueDate !== undefined) {
      task.dueDate = input.dueDate;
    }

    return this.taskRepo.save(task);
  }

  async deleteTask(access: AccessContext, projectId: string, taskId: string): Promise<void> {
    const task = await this.findAccessibleTask(access, projectId, taskId);
    await this.taskRepo.remove(task);
  }

  private async findAccessibleTask(
    access: AccessContext,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    const projectFilter = isAdmin(access)
      ? { id: projectId }
      : { id: projectId, user: { id: access.userId } };

    const task = await this.taskRepo.findOne({
      where: {
        id: taskId,
        project: projectFilter,
      },
    });

    if (!task) {
      throw new AppError(404, "Task not found");
    }

    return task;
  }
}

export const taskService = new TaskService();
