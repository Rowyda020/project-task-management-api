import { loginSchema } from "./login.dto";

const validPassword = "Password1!";

describe("loginSchema", () => {
  it("accepts valid login input", () => {
    const { error, value } = loginSchema.validate({
      email: "jane@example.com",
      password: validPassword,
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      email: "jane@example.com",
      password: validPassword,
    });
  });

  it("rejects missing email", () => {
    const { error } = loginSchema.validate({
      password: validPassword,
    });

    expect(error?.message).toContain("Email is required");
  });

  it("rejects invalid email format", () => {
    const { error } = loginSchema.validate({
      email: "bad-email",
      password: validPassword,
    });

    expect(error?.message).toContain("Invalid email address");
  });

  it("rejects missing password", () => {
    const { error } = loginSchema.validate({
      email: "jane@example.com",
    });

    expect(error?.message).toContain("Password is required");
  });
});
