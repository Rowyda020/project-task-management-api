import Joi from "joi";

export const projectParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.uuid": "Project id must be a valid UUID",
    "any.required": "Project id is required",
  }),
});
