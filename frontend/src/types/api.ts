export type EventType = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
};

export type Slot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

export type Booking = {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
};

export type CreateBookingRequest = {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
};

export type CreateEventTypeRequest = {
  title: string;
  description: string;
  durationMinutes: number;
};

export type ApiErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "TIME_SLOT_CONFLICT";

export type ApiErrorPayload = {
  code: ApiErrorCode;
  message: string;
};

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(status: number, payload: ApiErrorPayload | null) {
    super(payload?.message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}
