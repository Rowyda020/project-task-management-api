import { updateTaskSchema } from "../dtos/update-task.dto";
import { listTasksQuerySchema } from "../dtos/task-params.dto";
import { TaskPriority } from "../enums/task-priority.enum";
import { TaskStatus } from "../enums/task-status.enum";

describe("updateTaskSchema", () => {
  it("accepts a partial update", () => {
    const { error, value } = updateTaskSchema.validate({ status: TaskStatus.DONE });

    expect(error).toBeUndefined();
    expect(value).toEqual({ status: TaskStatus.DONE });
  });

  it("rejects an empty update object", () => {
    const { error } = updateTaskSchema.validate({});

    expect(error?.message).toContain("At least one field must be provided for update");
  });
});

describe("listTasksQuerySchema", () => {
  it("accepts status and priority filters", () => {
    const { error, value } = listTasksQuerySchema.validate({
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      page: 1,
      limit: 10,
      sortBy: "dueDate",
      sortOrder: "asc",
    });
  });

  it("accepts an empty query with pagination defaults", () => {
    const { error, value } = listTasksQuerySchema.validate({});

    expect(error).toBeUndefined();
    expect(value).toEqual({
      page: 1,
      limit: 10,
      sortBy: "dueDate",
      sortOrder: "asc",
    });
  });

  it("coerces string query params for pagination", () => {
    const { error, value } = listTasksQuerySchema.validate({
      page: "2",
      limit: "25",
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      page: 2,
      limit: 25,
      sortBy: "dueDate",
      sortOrder: "asc",
    });
  });

  it("rejects invalid filter values", () => {
    const { error } = listTasksQuerySchema.validate({ status: "invalid" });

    expect(error?.message).toContain("Status must be one of");
  });

  it("rejects invalid sort field", () => {
    const { error } = listTasksQuerySchema.validate({ sortBy: "invalid" });

    expect(error?.message).toContain("Sort field must be one of");
  });
});
