import { createProjectSchema } from "../dtos/create-project.dto";
import { ProjectStatus } from "../enums/project-status.enum";

describe("createProjectSchema", () => {
  const validInput = {
    title: "Website Redesign",
    description: "Rebuild the company website",
    status: ProjectStatus.IN_PROGRESS,
  };

  it("accepts valid project input", () => {
    const { error, value } = createProjectSchema.validate(validInput);

    expect(error).toBeUndefined();
    expect(value).toEqual(validInput);
  });

  it("rejects missing title", () => {
    const { error } = createProjectSchema.validate({
      description: validInput.description,
      status: validInput.status,
    });

    expect(error?.message).toContain("Title is required");
  });

  it("rejects invalid status", () => {
    const { error } = createProjectSchema.validate({
      ...validInput,
      status: "invalid-status",
    });

    expect(error?.message).toContain("Status must be one of");
  });

  it("rejects title longer than 255 characters", () => {
    const { error } = createProjectSchema.validate({
      ...validInput,
      title: "a".repeat(256),
    });

    expect(error).toBeDefined();
  });
});
