import { FindOptionsWhere } from "typeorm";
import { AppError } from "../../common/filters/error.filter";
import { dataSource } from "../../config/data-source";
import { projectService } from "../../projects/services/project.service";
import { CreateTaskInput } from "../dtos/create-task.dto";
import { ListTasksQuery } from "../dtos/task-params.dto";
import { UpdateTaskInput } from "../dtos/update-task.dto";
import { Task } from "../models/task.entity";

export class TaskService {
  private readonly taskRepo = dataSource.getRepository(Task);

  async createTask(
    userId: string,
    projectId: string,
    input: CreateTaskInput,
  ): Promise<Task> {
    await projectService.findOneByUserId(userId, projectId);

    const task = this.taskRepo.create({
      ...input,
      project: { id: projectId },
    });

    return this.taskRepo.save(task);
  }

  async findAllByProject(
    userId: string,
    projectId: string,
    filters: ListTasksQuery,
  ): Promise<Task[]> {
    await projectService.findOneByUserId(userId, projectId);

    const where: FindOptionsWhere<Task> = {
      project: { id: projectId },
    };

    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    if (filters.priority !== undefined) {
      where.priority = filters.priority;
    }

    return this.taskRepo.find({ where });
  }

  async findOneByUser(
    userId: string,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    return this.findOwnedTask(userId, projectId, taskId);
  }

  async updateTask(
    userId: string,
    projectId: string,
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<Task> {
    const task = await this.findOwnedTask(userId, projectId, taskId);

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

  async deleteTask(userId: string, projectId: string, taskId: string): Promise<void> {
    const task = await this.findOwnedTask(userId, projectId, taskId);
    await this.taskRepo.remove(task);
  }

  private async findOwnedTask(
    userId: string,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: {
        id: taskId,
        project: { id: projectId, user: { id: userId } },
      },
    });

    if (!task) {
      throw new AppError(404, "Task not found");
    }

    return task;
  }
}

export const taskService = new TaskService();
