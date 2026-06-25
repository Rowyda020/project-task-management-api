import { AppError } from "../../common/filters/error.filter";
import { dataSource } from "../../config/data-source";
import { CreateProjectInput } from "../dtos/create-project.dto";
import { UpdateProjectInput } from "../dtos/update-project.dto";
import { Project } from "../models/project.entity";

export class ProjectService {
  private readonly projectRepo = dataSource.getRepository(Project);

  async createProject(userId: string, input: CreateProjectInput): Promise<Project> {
    const project = this.projectRepo.create({
      ...input,
      user: { id: userId },
    });
    return this.projectRepo.save(project);
  }

  async findAllByUserId(userId: string): Promise<Project[]> {
    return this.projectRepo.find({ where: { user: { id: userId } } });
  }

  async findOneByUserId(userId: string, projectId: string): Promise<Project> {
    return this.findOwnedProject(userId, projectId);
  }

  async updateProject(
    userId: string,
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    const project = await this.findOwnedProject(userId, projectId);

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

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const project = await this.findOwnedProject(userId, projectId);
    await this.projectRepo.remove(project);
  }

  private async findOwnedProject(userId: string, projectId: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, user: { id: userId } },
    });

    if (!project) {
      throw new AppError(404, "Project not found");
    }

    return project;
  }
}

export const projectService = new ProjectService();
