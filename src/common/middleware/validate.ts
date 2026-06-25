import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { AppError } from "../filters/error.filter";

function formatValidationError(error: Joi.ValidationError): AppError {
  return new AppError(400, error.details.map((d) => d.message).join(", "));
}

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(formatValidationError(error));
      return;
    }

    req.body = value;
    next();
  };
}

export function validateParams(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(formatValidationError(error));
      return;
    }

    req.params = value;
    next();
  };
}

export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      next(formatValidationError(error));
      return;
    }

    req.query = value;
    next();
  };
}
