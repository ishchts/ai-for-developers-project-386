import { API_BASE_URL } from "./config";
import type {
  Booking,
  BookingStatus,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  PaginatedBookings,
  Slot,
  ApiErrorPayload,
  UpdateBookingRequest,
  UpdateEventTypeRequest,
} from "../types/api";
import { ApiError } from "../types/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});

  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
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

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
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

  searchBookings(status: BookingStatus, page: number, pageSize: number): Promise<PaginatedBookings> {
    const params = new URLSearchParams({
      status,
      page: String(page),
      pageSize: String(pageSize),
    });

    return request<PaginatedBookings>(`/owner/bookings/search?${params.toString()}`);
  },

  updateBooking(bookingId: string, payload: UpdateBookingRequest): Promise<Booking> {
    return request<Booking>(`/owner/bookings/${encodeURIComponent(bookingId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteBooking(bookingId: string): Promise<Booking> {
    return request<Booking>(`/owner/bookings/${encodeURIComponent(bookingId)}`, {
      method: "DELETE",
    });
  },

  createEventType(payload: CreateEventTypeRequest): Promise<EventType> {
    return request<EventType>("/owner/event-types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateEventType(eventTypeId: string, payload: UpdateEventTypeRequest): Promise<EventType> {
    return request<EventType>(`/owner/event-types/${encodeURIComponent(eventTypeId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteEventType(eventTypeId: string): Promise<EventType> {
    return request<EventType>(`/owner/event-types/${encodeURIComponent(eventTypeId)}`, {
      method: "DELETE",
    });
  },
};
