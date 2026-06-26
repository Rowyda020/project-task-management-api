import { Request } from "express";

const validatedBodyStore = new WeakMap<Request, unknown>();
const validatedQueryStore = new WeakMap<Request, unknown>();
const validatedParamsStore = new WeakMap<Request, unknown>();

export function setValidatedBody(req: Request, value: unknown): void {
  validatedBodyStore.set(req, value);
}

export function setValidatedQuery(req: Request, value: unknown): void {
  validatedQueryStore.set(req, value);
}

export function setValidatedParams(req: Request, value: unknown): void {
  validatedParamsStore.set(req, value);
}

export function getValidatedBody<T>(req: Request): T {
  return (validatedBodyStore.get(req) ?? req.body) as T;
}

export function getValidatedQuery<T>(req: Request): T {
  return (validatedQueryStore.get(req) ?? req.query) as T;
}

export function getValidatedParams<T>(req: Request): T {
  return (validatedParamsStore.get(req) ?? req.params) as T;
}

export function cloneRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(Object.entries(value));
  }
  return {};
}
