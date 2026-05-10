import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@traveloop/shared";

const CODE_TO_STATUS: Record<string, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
};

export function errorHandler(err: Error & { code?: string; status?: number }, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status ?? CODE_TO_STATUS[err.code ?? ""] ?? 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error("[ERROR]", err.message, err.stack);
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code: err.code ?? "INTERNAL_ERROR",
      message: isServerError && process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
    },
  };

  res.status(status).json(response);
}

export function notFound(_req: Request, res: Response) {
  const response: ApiResponse = {
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  };
  res.status(404).json(response);
}
