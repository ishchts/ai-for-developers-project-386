import type { ApiErrorCode } from "./types";

export class ApiError extends Error {
  readonly statusCode: 400 | 404 | 409;
  readonly code: ApiErrorCode;

  constructor(statusCode: 400 | 404 | 409, code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function badRequest(message: string): ApiError {
  return new ApiError(400, "BAD_REQUEST", message);
}

export function notFound(message: string): ApiError {
  return new ApiError(404, "NOT_FOUND", message);
}

export function conflict(message: string): ApiError {
  return new ApiError(409, "TIME_SLOT_CONFLICT", message);
}
