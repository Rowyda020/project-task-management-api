import Joi from "joi";
import {
  paginationFields,
  PaginationQuery,
  sortingFields,
  SortQuery,
} from "../../common/dtos/pagination.dto";
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

export const TASK_SORT_FIELDS = ["title", "status", "priority", "dueDate"] as const;
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];

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
  ...paginationFields(),
  ...sortingFields(TASK_SORT_FIELDS, "dueDate"),
});

export type ListTasksQuery = PaginationQuery &
  SortQuery<TaskSortField> & {
    status?: TaskStatus;
    priority?: TaskPriority;
  };

export type TaskProjectParams = {
  projectId: string;
};

export type TaskParams = {
  projectId: string;
  taskId: string;
};
