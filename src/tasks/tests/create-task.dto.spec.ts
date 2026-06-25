import { createTaskSchema } from "../dtos/create-task.dto";
import { TaskPriority } from "../enums/task-priority.enum";
import { TaskStatus } from "../enums/task-status.enum";

describe("createTaskSchema", () => {
  const validInput = {
    title: "Design homepage",
    description: "Create wireframes",
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    dueDate: "2026-12-31T00:00:00.000Z",
  };

  it("accepts valid task input", () => {
    const { error, value } = createTaskSchema.validate(validInput);

    expect(error).toBeUndefined();
    expect(value.title).toBe(validInput.title);
    expect(value.dueDate).toEqual(new Date(validInput.dueDate));
  });

  it("rejects missing title", () => {
    const { error } = createTaskSchema.validate({
      ...validInput,
      title: undefined,
    });

    expect(error?.message).toContain("Title is required");
  });

  it("rejects invalid status", () => {
    const { error } = createTaskSchema.validate({
      ...validInput,
      status: "invalid",
    });

    expect(error?.message).toContain("Status must be one of");
  });

  it("rejects invalid priority", () => {
    const { error } = createTaskSchema.validate({
      ...validInput,
      priority: "urgent",
    });

    expect(error?.message).toContain("Priority must be one of");
  });
});
