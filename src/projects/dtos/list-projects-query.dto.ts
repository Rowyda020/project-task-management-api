import Joi from "joi";
import {
  paginationFields,
  PaginationQuery,
  sortingFields,
  SortQuery,
} from "../../common/dtos/pagination.dto";

export const PROJECT_SORT_FIELDS = ["title", "status"] as const;
export type ProjectSortField = (typeof PROJECT_SORT_FIELDS)[number];

export const listProjectsQuerySchema = Joi.object({
  ...paginationFields(),
  ...sortingFields(PROJECT_SORT_FIELDS, "title"),
});

export type ListProjectsQuery = PaginationQuery & SortQuery<ProjectSortField>;
