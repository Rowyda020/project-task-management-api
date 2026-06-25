import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
    "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

export type LoginInput = {
  email: string;
  password: string;
};
