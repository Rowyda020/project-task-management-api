import Joi from "joi";
import { ProjectStatus } from "../enums/project-status.enum";

export const updateProjectSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().optional(),
  status: Joi.string()
    .valid(...Object.values(ProjectStatus))
    .optional()
    .messages({
      "any.only": "Status must be one of: in progress, completed, cancelled",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export type UpdateProjectInput = {
  title?: string;
  description?: string;
  status?: ProjectStatus;
};
