import { Request, Response } from "express";
import { AppError } from "../../common/filters/error.filter";
import { Project } from "../models/project.entity";
import { CreateProjectInput } from "../dtos/create-project.dto";
import { UpdateProjectInput } from "../dtos/update-project.dto";
import { projectService } from "../services/project.service";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new AppError(401, "Unauthorized");
  }
  return req.user.id;
}

function getProjectId(req: Request): string {
  const { id } = req.params;
  if (typeof id !== "string") {
    throw new AppError(400, "Project id must be a valid UUID");
  }
  return id;
}

function toProjectResponse(project: Project) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
  };
}

export class ProjectController {
  async create(req: Request, res: Response): Promise<void> {
    const project = await projectService.createProject(
      getUserId(req),
      req.body as CreateProjectInput,
    );
    res.status(201).json(toProjectResponse(project));
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const projects = await projectService.findAllByUserId(getUserId(req));
    res.status(200).json(projects.map(toProjectResponse));
  }

  async findOne(req: Request, res: Response): Promise<void> {
    const project = await projectService.findOneByUserId(getUserId(req), getProjectId(req));
    res.status(200).json(toProjectResponse(project));
  }

  async update(req: Request, res: Response): Promise<void> {
    const project = await projectService.updateProject(
      getUserId(req),
      getProjectId(req),
      req.body as UpdateProjectInput,
    );
    res.status(200).json(toProjectResponse(project));
  }

  async delete(req: Request, res: Response): Promise<void> {
    await projectService.deleteProject(getUserId(req), getProjectId(req));
    res.status(204).send();
  }
}

export const projectController = new ProjectController();
