import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { AppError } from "../filters/error.filter";

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(new AppError(400, error.details.map((d) => d.message).join(", ")));
      return;
    }

    req.body = value;
    next();
  };
}
