import Joi from "joi";
import { TaskPriority } from "../enums/task-priority.enum";
import { TaskStatus } from "../enums/task-status.enum";

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().optional(),
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
  dueDate: Joi.date().iso().optional().messages({
    "date.format": "Due date must be a valid ISO date",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
};
