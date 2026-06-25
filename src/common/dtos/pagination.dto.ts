import Joi from "joi";

export const SortOrder = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export type PaginationQuery = {
  page: number;
  limit: number;
};

export type SortQuery<T extends string> = {
  sortBy: T;
  sortOrder: SortOrder;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

export function mapPaginatedResult<T, U>(
  result: PaginatedResult<T>,
  mapper: (item: T) => U,
): PaginatedResult<U> {
  return {
    data: result.data.map(mapper),
    meta: result.meta,
  };
}

export function paginationFields() {
  return {
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": "Page must be at least 1",
      "number.base": "Page must be a number",
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": "Limit must be at least 1",
      "number.max": "Limit must not exceed 100",
      "number.base": "Limit must be a number",
    }),
  };
}

export function sortingFields<T extends string>(sortableFields: readonly T[], defaultSortBy: T) {
  return {
    sortBy: Joi.string()
      .valid(...sortableFields)
      .default(defaultSortBy)
      .messages({
        "any.only": `Sort field must be one of: ${sortableFields.join(", ")}`,
      }),
    sortOrder: Joi.string()
      .valid(SortOrder.ASC, SortOrder.DESC)
      .default(SortOrder.ASC)
      .messages({
        "any.only": "Sort order must be asc or desc",
      }),
  };
}

export function toFindOptions(page: number, limit: number, sortBy: string, sortOrder: SortOrder) {
  return {
    skip: (page - 1) * limit,
    take: limit,
    order: { [sortBy]: sortOrder.toUpperCase() as "ASC" | "DESC" },
  };
}
