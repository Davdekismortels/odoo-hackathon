import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import type { ApiResponse } from "@traveloop/shared";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: result.error.issues[0]?.message ?? "Invalid input",
          details: result.error.issues,
        },
      };
      res.status(400).json(response);
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: result.error.issues,
        },
      };
      res.status(400).json(response);
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
