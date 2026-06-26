import { Request, Response } from "express";
import { mapPaginatedResult } from "../../common/dtos/pagination.dto";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "../../common/middleware/validated-request";
import { getAccessContext } from "../../common/types/access-context";
import { CreateProjectInput } from "../dtos/create-project.dto";
import { ListProjectsQuery } from "../dtos/list-projects-query.dto";
import { ProjectParams } from "../dtos/project-params.dto";
import { UpdateProjectInput } from "../dtos/update-project.dto";
import { Project } from "../models/project.entity";
import { projectService } from "../services/project.service";

function getProjectId(req: Request): string {
  return getValidatedParams<ProjectParams>(req).id;
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
      getValidatedBody<CreateProjectInput>(req),
    );
    res.status(201).json(toProjectResponse(project));
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const result = await projectService.findAll(
      getAccessContext(req),
      getValidatedQuery<ListProjectsQuery>(req),
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
      getValidatedBody<UpdateProjectInput>(req),
    );
    res.status(200).json(toProjectResponse(project));
  }

  async delete(req: Request, res: Response): Promise<void> {
    await projectService.deleteProject(getAccessContext(req), getProjectId(req));
    res.status(204).send();
  }
}

export const projectController = new ProjectController();