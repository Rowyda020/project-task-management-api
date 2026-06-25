import Joi from "joi";
import { TaskPriority } from "../enums/task-priority.enum";
import { TaskStatus } from "../enums/task-status.enum";

export const taskProjectParamsSchema = Joi.object({
  projectId: Joi.string().uuid().required().messages({
    "string.uuid": "Project id must be a valid UUID",
    "any.required": "Project id is required",
  }),
});

export const taskParamsSchema = Joi.object({
  projectId: Joi.string().uuid().required().messages({
    "string.uuid": "Project id must be a valid UUID",
    "any.required": "Project id is required",
  }),
  taskId: Joi.string().uuid().required().messages({
    "string.uuid": "Task id must be a valid UUID",
    "any.required": "Task id is required",
  }),
});

export const listTasksQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .optional()
    .messages({
      "any.only": "Status must be one of: pending, in progress, done",
    }),
  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .optional()
    .messages({
      "any.only": "Priority must be one of: low, medium, high",
    }),
});

export type ListTasksQuery = {
  status?: TaskStatus;
  priority?: TaskPriority;
};
