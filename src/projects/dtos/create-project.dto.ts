import Joi from "joi";
import { ProjectStatus } from "../enums/project-status.enum";

export const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  status: Joi.string()
    .valid(...Object.values(ProjectStatus))
    .required()
    .messages({
      "any.only": "Status must be one of: in progress, completed, cancelled",
      "any.required": "Status is required",
    }),
});

export type CreateProjectInput = {
  title: string;
  description: string;
  status: ProjectStatus;
};
