import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { AppError } from "../filters/error.filter";
import {
  cloneRecord,
  setValidatedBody,
  setValidatedParams,
  setValidatedQuery,
} from "./validated-request";

function formatValidationError(error: Joi.ValidationError): AppError {
  return new AppError(400, error.details.map((d) => d.message).join(", "));
}

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(cloneRecord(req.body), {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(formatValidationError(error));
      return;
    }

    setValidatedBody(req, value);
    next();
  };
}

export function validateParams(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(cloneRecord(req.params), {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(formatValidationError(error));
      return;
    }

    setValidatedParams(req, value);
    next();
  };
}

export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(cloneRecord(req.query), {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      next(formatValidationError(error));
      return;
    }

    setValidatedQuery(req, value);
    next();
  };
}
