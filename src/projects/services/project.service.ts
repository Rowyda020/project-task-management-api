import { FindOptionsWhere } from "typeorm";
import { AppError } from "../../common/filters/error.filter";
import { createPaginatedResult, PaginatedResult, toFindOptions } from "../../common/dtos/pagination.dto";
import { AccessContext, isAdmin } from "../../common/types/access-context";
import { dataSource } from "../../config/data-source";
import { CreateProjectInput } from "../dtos/create-project.dto";
import { ListProjectsQuery } from "../dtos/list-projects-query.dto";
import { UpdateProjectInput } from "../dtos/update-project.dto";
import { Project } from "../models/project.entity";

export class ProjectService {
  private readonly projectRepo = dataSource.getRepository(Project);

  async createProject(access: AccessContext, input: CreateProjectInput): Promise<Project> {
    const project = this.projectRepo.create({
      ...input,
      user: { id: access.userId },
    });
    return this.projectRepo.save(project);
  }

  async findAll(access: AccessContext, query: ListProjectsQuery): Promise<PaginatedResult<Project>> {
    const { page, limit, sortBy, sortOrder } = query;
    const where: FindOptionsWhere<Project> = isAdmin(access)
      ? {}
      : { user: { id: access.userId } };
    const [data, total] = await this.projectRepo.findAndCount({
      where,
      ...toFindOptions(page, limit, sortBy, sortOrder),
    });
    return createPaginatedResult(data, total, page, limit);
  }

  async findOne(access: AccessContext, projectId: string): Promise<Project> {
    return this.findAccessibleProject(access, projectId);
  }

  async updateProject(
    access: AccessContext,
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    const project = await this.findAccessibleProject(access, projectId);
    if (input.title !== undefined) {
      project.title = input.title;
    }
    if (input.description !== undefined) {
      project.description = input.description;
    }
    if (input.status !== undefined) {
      project.status = input.status;
    }
    return this.projectRepo.save(project);
  }

  async deleteProject(access: AccessContext, projectId: string): Promise<void> {
    const project = await this.findAccessibleProject(access, projectId);
    await this.projectRepo.remove(project);
  }

  private async findAccessibleProject(
    access: AccessContext,
    projectId: string,
  ): Promise<Project> {
    const where: FindOptionsWhere<Project> = isAdmin(access)
      ? { id: projectId }
      : { id: projectId, user: { id: access.userId } };
    const project = await this.projectRepo.findOne({ where });
    if (!project) {
      throw new AppError(404, "Project not found");
    }
    return project;
  }
}

export const projectService = new ProjectService();
