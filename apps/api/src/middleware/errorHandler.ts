import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@traveloop/shared";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("[ERROR]", err.message, err.stack);

  const response: ApiResponse = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message,
    },
  };

  res.status(500).json(response);
}

export function notFound(_req: Request, res: Response) {
  const response: ApiResponse = {
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  };
  res.status(404).json(response);
}
