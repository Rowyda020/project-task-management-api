import { registerSchema } from "../dtos/register.dto";

const validPassword = "Password1!";

describe("registerSchema", () => {
  it("accepts valid registration input", () => {
    const { error, value } = registerSchema.validate({
      name: "Jane Doe",
      email: "jane@example.com",
      password: validPassword,
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      name: "Jane Doe",
      email: "jane@example.com",
      password: validPassword,
    });
  });

  it("rejects missing name", () => {
    const { error } = registerSchema.validate({
      email: "jane@example.com",
      password: validPassword,
    });

    expect(error?.message).toContain("Name is required");
  });

  it("rejects invalid email", () => {
    const { error } = registerSchema.validate({
      name: "Jane Doe",
      email: "not-an-email",
      password: validPassword,
    });

    expect(error?.message).toContain("Invalid email address");
  });

  it("rejects weak passwords", () => {
    const { error } = registerSchema.validate({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password",
    });

    expect(error?.message).toContain(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    );
  });
});
