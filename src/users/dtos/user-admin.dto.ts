import Joi from "joi";
import { UserRole } from "../enums/user-role.enum";

export const userParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.uuid": "User id must be a valid UUID",
    "any.required": "User id is required",
  }),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      "any.only": "Role must be one of: admin, member",
      "any.required": "Role is required",
    }),
});

export type UpdateUserRoleInput = {
  role: UserRole;
};
