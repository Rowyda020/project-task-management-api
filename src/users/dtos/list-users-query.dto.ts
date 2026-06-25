import Joi from "joi";
import {
  paginationFields,
  PaginationQuery,
  sortingFields,
  SortQuery,
} from "../../common/dtos/pagination.dto";

export const USER_SORT_FIELDS = ["name", "email", "role", "createdAt"] as const;
export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export const listUsersQuerySchema = Joi.object({
  ...paginationFields(),
  ...sortingFields(USER_SORT_FIELDS, "createdAt"),
});

export type ListUsersQuery = PaginationQuery & SortQuery<UserSortField>;
