import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { ApiError, badRequest, conflict, notFound } from "./errors";
import {
  bookingSchema,
  createBookingRequestSchema,
  createEventTypeRequestSchema,
  errorSchema,
  eventTypeSchema,
  paginatedBookingsSchema,
  slotSchema,
  updateBookingRequestSchema,
  updateEventTypeRequestSchema,
} from "./schemas";
import { createStore } from "./store";
import { generateSlots, isValidDateInput, parseDateTime, toDateInputValue } from "./time";
import type {
  Booking,
  BookingListStatus,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  PaginatedBookings,
  Slot,
  Store,
  UpdateBookingRequest,
  UpdateEventTypeRequest,
} from "./types";

type EventTypeParams = {
  eventTypeId: string;
};

type SlotsQuery = {
  date: string;
};

type BookingListQuery = {
  status?: BookingListStatus;
  page?: string;
  pageSize?: string;
};

type BookingParams = {
  bookingId: string;
};

type ValidationError = Error & {
  validation?: unknown;
};

export type ApiRoutesOptions = {
  store?: Store;
  getNow?: () => Date;
  createId?: () => string;
};

export function registerApiRoutes(
  app: FastifyInstance,
  options: ApiRoutesOptions = {},
): void {
  const store = options.store ?? createStore();
  const getNow = options.getNow ?? (() => new Date());
  const createId = options.createId ?? crypto.randomUUID;

  app.setErrorHandler((error: ValidationError, request, reply) => {
    if (error instanceof ApiError) {
      reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
      });
      return;
    }

    if (error.validation) {
      reply.status(400).send({
        code: "BAD_REQUEST",
        message: error.message,
      });
      return;
    }

    request.log.error(error);
    reply.status(500).send({
      code: "BAD_REQUEST",
      message: "Unexpected server error.",
    });
  });

  app.get("/event-types", {
    schema: {
      response: {
        200: {
          type: "array",
          items: eventTypeSchema,
        },
      },
    },
  }, async (): Promise<EventType[]> => store.eventTypes);

  app.post<{ Body: CreateEventTypeRequest }>("/owner/event-types", {
    schema: {
      body: createEventTypeRequestSchema,
      response: {
        201: eventTypeSchema,
        400: errorSchema,
      },
    },
  }, async (request, reply): Promise<void> => {
    const eventType: EventType = {
      id: createId(),
      title: request.body.title,
      description: request.body.description,
      durationMinutes: request.body.durationMinutes,
    };

    store.eventTypes.push(eventType);
    reply.status(201).send(eventType);
  });

  app.patch<{ Params: EventTypeParams; Body: UpdateEventTypeRequest }>("/owner/event-types/:eventTypeId", {
    schema: {
      params: {
        type: "object",
        required: ["eventTypeId"],
        properties: {
          eventTypeId: { type: "string" },
        },
      },
      body: updateEventTypeRequestSchema,
      response: {
        200: eventTypeSchema,
        400: errorSchema,
        404: errorSchema,
      },
    },
  }, async (request): Promise<EventType> => {
    const eventType = findEventType(store, request.params.eventTypeId);

    if (!eventType) {
      throw notFound("Event type not found.");
    }

    if (request.body.title !== undefined) {
      eventType.title = request.body.title;
    }

    if (request.body.description !== undefined) {
      eventType.description = request.body.description;
    }

    if (request.body.durationMinutes !== undefined) {
      eventType.durationMinutes = request.body.durationMinutes;
    }

    return eventType;
  });

  app.delete<{ Params: EventTypeParams }>("/owner/event-types/:eventTypeId", {
    schema: {
      params: {
        type: "object",
        required: ["eventTypeId"],
        properties: {
          eventTypeId: { type: "string" },
        },
      },
      response: {
        200: eventTypeSchema,
        400: errorSchema,
        404: errorSchema,
      },
    },
  }, async (request): Promise<EventType> => {
    const eventType = findEventType(store, request.params.eventTypeId);

    if (!eventType) {
      throw notFound("Event type not found.");
    }

    const hasBookings = store.bookings.some((booking) => booking.eventTypeId === eventType.id);

    if (hasBookings) {
      throw badRequest("Cannot delete an event type with existing bookings.");
    }

    store.eventTypes = store.eventTypes.filter((entry) => entry.id !== eventType.id);
    return eventType;
  });

  app.get<{ Params: EventTypeParams; Querystring: SlotsQuery }>("/event-types/:eventTypeId/slots", {
    schema: {
      params: {
        type: "object",
        required: ["eventTypeId"],
        properties: {
          eventTypeId: { type: "string" },
        },
      },
      querystring: {
        type: "object",
        required: ["date"],
        properties: {
          date: { type: "string" },
        },
      },
      response: {
        200: {
          type: "array",
          items: slotSchema,
        },
        400: errorSchema,
        404: errorSchema,
      },
    },
  }, async (request): Promise<Slot[]> => {
    const eventType = findEventType(store, request.params.eventTypeId);

    if (!eventType) {
      throw notFound("Event type not found.");
    }

    if (!isValidDateInput(request.query.date)) {
      throw badRequest("Query parameter 'date' must be a valid YYYY-MM-DD value.");
    }

    return listSlotsForEventType(store, eventType, request.query.date);
  });

  app.post<{ Body: CreateBookingRequest }>("/bookings", {
    schema: {
      body: createBookingRequestSchema,
      response: {
        201: bookingSchema,
        400: errorSchema,
        404: errorSchema,
        409: errorSchema,
      },
    },
  }, async (request, reply): Promise<void> => {
    const eventType = findEventType(store, request.body.eventTypeId);

    if (!eventType) {
      throw notFound("Event type not found.");
    }

    const startDate = parseDateTime(request.body.startTime);

    if (!startDate) {
      throw badRequest("Field 'startTime' must be a valid date-time.");
    }

    const bookingDate = toDateInputValue(startDate);
    const allowedSlots = generateSlots(bookingDate, eventType.durationMinutes);
    const matchingSlot = allowedSlots.find((slot) => slot.startTime === startDate.toISOString());

    if (!matchingSlot) {
      throw badRequest("Field 'startTime' must match an available generated slot for the requested day.");
    }

    const hasConflict = store.bookings.some(
      (booking) => booking.startTime === matchingSlot.startTime,
    );

    if (hasConflict) {
      throw conflict("This time slot is already booked.");
    }

    const booking: Booking = {
      id: createId(),
      eventTypeId: eventType.id,
      guestName: request.body.guestName,
      guestEmail: request.body.guestEmail,
      startTime: matchingSlot.startTime,
      endTime: matchingSlot.endTime,
    };

    store.bookings.push(booking);
    reply.status(201).send(booking);
  });

  app.patch<{ Params: BookingParams; Body: UpdateBookingRequest }>("/owner/bookings/:bookingId", {
    schema: {
      params: {
        type: "object",
        required: ["bookingId"],
        properties: {
          bookingId: { type: "string" },
        },
      },
      body: updateBookingRequestSchema,
      response: {
        200: bookingSchema,
        400: errorSchema,
        404: errorSchema,
        409: errorSchema,
      },
    },
  }, async (request): Promise<Booking> => {
    const booking = findBooking(store, request.params.bookingId);

    if (!booking) {
      throw notFound("Booking not found.");
    }

    const nextEventTypeId = request.body.eventTypeId ?? booking.eventTypeId;
    const nextGuestName = request.body.guestName ?? booking.guestName;
    const nextGuestEmail = request.body.guestEmail ?? booking.guestEmail;
    const nextStartTime = request.body.startTime ?? booking.startTime;

    const eventType = findEventType(store, nextEventTypeId);

    if (!eventType) {
      throw notFound("Event type not found.");
    }

    const resolvedSlot = resolveMatchingSlot(nextStartTime, eventType.durationMinutes);

    if (!resolvedSlot) {
      throw badRequest("Field 'startTime' must match an available generated slot for the requested day.");
    }

    const hasConflict = store.bookings.some(
      (entry) => entry.id !== booking.id && entry.startTime === resolvedSlot.startTime,
    );

    if (hasConflict) {
      throw conflict("This time slot is already booked.");
    }

    booking.eventTypeId = eventType.id;
    booking.guestName = nextGuestName;
    booking.guestEmail = nextGuestEmail;
    booking.startTime = resolvedSlot.startTime;
    booking.endTime = resolvedSlot.endTime;

    return booking;
  });

  app.delete<{ Params: BookingParams }>("/owner/bookings/:bookingId", {
    schema: {
      params: {
        type: "object",
        required: ["bookingId"],
        properties: {
          bookingId: { type: "string" },
        },
      },
      response: {
        200: bookingSchema,
        404: errorSchema,
      },
    },
  }, async (request): Promise<Booking> => {
    const booking = findBooking(store, request.params.bookingId);

    if (!booking) {
      throw notFound("Booking not found.");
    }

    store.bookings = store.bookings.filter((entry) => entry.id !== booking.id);
    return booking;
  });

  app.get("/owner/bookings", {
    schema: {
      response: {
        200: {
          type: "array",
          items: bookingSchema,
        },
      },
    },
  }, async (): Promise<Booking[]> => {
    const now = getNow().getTime();

    return store.bookings
      .filter((booking) => new Date(booking.startTime).getTime() > now)
      .slice()
      .sort((left, right) => left.startTime.localeCompare(right.startTime));
  });

  app.get<{ Querystring: BookingListQuery }>("/owner/bookings/search", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["upcoming", "past"],
          },
          page: { type: "string" },
          pageSize: { type: "string" },
        },
      },
      response: {
        200: paginatedBookingsSchema,
        400: errorSchema,
      },
    },
  }, async (request): Promise<PaginatedBookings> => {
    const status = request.query.status ?? "upcoming";
    const page = parsePositiveInteger(request.query.page, "page");
    const pageSize = parsePositiveInteger(request.query.pageSize, "pageSize", 5);
    const now = getNow().getTime();

    const filtered = store.bookings
      .filter((booking) =>
        status === "upcoming"
          ? new Date(booking.startTime).getTime() > now
          : new Date(booking.startTime).getTime() <= now,
      )
      .slice()
      .sort((left, right) =>
        status === "upcoming"
          ? left.startTime.localeCompare(right.startTime)
          : right.startTime.localeCompare(left.startTime),
      );

    const totalItems = filtered.length;
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;

    return {
      items: filtered.slice(startIndex, startIndex + pageSize),
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    };
  });
}

function findEventType(store: Store, eventTypeId: string): EventType | null {
  return store.eventTypes.find((eventType) => eventType.id === eventTypeId) ?? null;
}

function findBooking(store: Store, bookingId: string): Booking | null {
  return store.bookings.find((booking) => booking.id === bookingId) ?? null;
}

function resolveMatchingSlot(startTime: string, durationMinutes: number): Slot | null {
  const startDate = parseDateTime(startTime);

  if (!startDate) {
    return null;
  }

  const bookingDate = toDateInputValue(startDate);
  return (
    generateSlots(bookingDate, durationMinutes).find(
      (slot) => slot.startTime === startDate.toISOString(),
    ) ?? null
  );
}

function parsePositiveInteger(value: string | undefined, field: string, fallback = 1): number {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw badRequest(`Query parameter '${field}' must be a positive integer.`);
  }

  return parsed;
}

function listSlotsForEventType(store: Store, eventType: EventType, date: string): Slot[] {
  const bookedStartTimes = new Set(store.bookings.map((booking) => booking.startTime));

  return generateSlots(date, eventType.durationMinutes).map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    available: !bookedStartTimes.has(slot.startTime),
  }));
}
