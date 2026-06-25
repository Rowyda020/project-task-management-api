import { updateProjectSchema } from "../dtos/update-project.dto";
import { ProjectStatus } from "../enums/project-status.enum";

describe("updateProjectSchema", () => {
  it("accepts a partial update with one field", () => {
    const { error, value } = updateProjectSchema.validate({
      title: "Updated Title",
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({ title: "Updated Title" });
  });

  it("accepts multiple optional fields", () => {
    const { error, value } = updateProjectSchema.validate({
      title: "Updated Title",
      status: ProjectStatus.COMPLETED,
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      title: "Updated Title",
      status: ProjectStatus.COMPLETED,
    });
  });

  it("rejects an empty update object", () => {
    const { error } = updateProjectSchema.validate({});

    expect(error?.message).toContain("At least one field must be provided for update");
  });

  it("rejects invalid status", () => {
    const { error } = updateProjectSchema.validate({
      status: "invalid-status",
    });

    expect(error?.message).toContain("Status must be one of");
  });
});
