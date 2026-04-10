import { API_BASE_URL } from "./config";
import type {
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  Slot,
  ApiErrorPayload,
} from "../types/api";
import { ApiError } from "../types/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    throw new ApiError(response.status, payload);
  }

  return (await response.json()) as T;
}

export const api = {
  listEventTypes(): Promise<EventType[]> {
    return request<EventType[]>("/event-types");
  },

  listSlots(eventTypeId: string, date: string): Promise<Slot[]> {
    const params = new URLSearchParams({ date });
    return request<Slot[]>(
      `/event-types/${encodeURIComponent(eventTypeId)}/slots?${params.toString()}`,
    );
  },

  createBooking(payload: CreateBookingRequest): Promise<Booking> {
    return request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listFutureBookings(): Promise<Booking[]> {
    return request<Booking[]>("/owner/bookings");
  },

  createEventType(payload: CreateEventTypeRequest): Promise<EventType> {
    return request<EventType>("/owner/event-types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
