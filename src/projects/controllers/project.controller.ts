import { Request, Response } from "express";
import { mapPaginatedResult } from "../../common/dtos/pagination.dto";
import { getAccessContext } from "../../common/types/access-context";
import { AppError } from "../../common/filters/error.filter";
import { Project } from "../models/project.entity";
import { CreateProjectInput } from "../dtos/create-project.dto";
import { ListProjectsQuery } from "../dtos/list-projects-query.dto";
import { UpdateProjectInput } from "../dtos/update-project.dto";
import { projectService } from "../services/project.service";

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
      getAccessContext(req),
      req.body as CreateProjectInput,
    );
    res.status(201).json(toProjectResponse(project));
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const result = await projectService.findAll(
      getAccessContext(req),
      req.query as unknown as ListProjectsQuery,
    );
    res.status(200).json(mapPaginatedResult(result, toProjectResponse));
  }

  async findOne(req: Request, res: Response): Promise<void> {
    const project = await projectService.findOne(getAccessContext(req), getProjectId(req));
    res.status(200).json(toProjectResponse(project));
  }

  async update(req: Request, res: Response): Promise<void> {
    const project = await projectService.updateProject(
      getAccessContext(req),
      getProjectId(req),
      req.body as UpdateProjectInput,
    );
    res.status(200).json(toProjectResponse(project));
  }

  async delete(req: Request, res: Response): Promise<void> {
    await projectService.deleteProject(getAccessContext(req), getProjectId(req));
    res.status(204).send();
  }
}

export const projectController = new ProjectController();