import Joi from "joi";
import { TaskPriority } from "../enums/task-priority.enum";
import { TaskStatus } from "../enums/task-status.enum";

export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .required()
    .messages({
      "any.only": "Status must be one of: pending, in progress, done",
      "any.required": "Status is required",
    }),
  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .required()
    .messages({
      "any.only": "Priority must be one of: low, medium, high",
      "any.required": "Priority is required",
    }),
  dueDate: Joi.date().iso().required().messages({
    "date.format": "Due date must be a valid ISO date",
    "any.required": "Due date is required",
  }),
});

export type CreateTaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
};
