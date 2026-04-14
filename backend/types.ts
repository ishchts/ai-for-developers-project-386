export type ApiErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "TIME_SLOT_CONFLICT";

export type ErrorResponse = {
  code: ApiErrorCode;
  message: string;
};

export type EventType = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
};

export type CreateEventTypeRequest = {
  title: string;
  description: string;
  durationMinutes: number;
};

export type UpdateEventTypeRequest = Partial<CreateEventTypeRequest>;

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

export type UpdateBookingRequest = Partial<CreateBookingRequest> & {
  guestName?: string;
  guestEmail?: string;
};

export type Slot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

export type Store = {
  eventTypes: EventType[];
  bookings: Booking[];
};

export type BookingListStatus = "upcoming" | "past";

export type PaginatedBookings = {
  items: Booking[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type BuildAppOptions = {
  store?: Store;
  getNow?: () => Date;
  createId?: () => string;
  logger?: boolean;
  staticRoot?: string | null;
};
