import "@typespec/http";

using TypeSpec.Http;

namespace CallBookingService;

// ============ Event Type ============
model EventType {
  @key
  id: string;

  @minLength(1)
  title: string;

  description: string;

  @minValue(1)
  durationMinutes: int32;
}

model CreateEventTypeRequest {
  @minLength(1)
  title: string;

  description: string;

  @minValue(1)
  durationMinutes: int32;
}

model UpdateEventTypeRequest {
  @minLength(1)
  title?: string;

  description?: string;

  @minValue(1)
  durationMinutes?: int32;
}

// ============ Booking ============
model Booking {
  @key
  id: string;

  eventTypeId: string;

  @minLength(1)
  guestName: string;

  @format("email")
  guestEmail: string;

  startTime: utcDateTime;

  endTime: utcDateTime;
}

model CreateBookingRequest {
  eventTypeId: string;

  @minLength(1)
  guestName: string;

  @format("email")
  guestEmail: string;

  startTime: utcDateTime;
}

model UpdateBookingRequest {
  eventTypeId?: string;

  @minLength(1)
  guestName?: string;

  @format("email")
  guestEmail?: string;

  startTime?: utcDateTime;
}

model PaginatedBookings {
  items: Booking[];
  page: int32;
  pageSize: int32;
  totalItems: int32;
  totalPages: int32;
}

// ============ Slot (вычисляемый) ============
model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  available: boolean;
}

// ============ Errors ============
@error
model ConflictError {
  @statusCode
  statusCode: 409;

  code: "TIME_SLOT_CONFLICT";
  message: string;
}

@error
model NotFoundError {
  @statusCode
  statusCode: 404;

  code: "NOT_FOUND";
  message: string;
}

@error
model BadRequestError {
  @statusCode
  statusCode: 400;

  code: "BAD_REQUEST";
  message: string;
}
