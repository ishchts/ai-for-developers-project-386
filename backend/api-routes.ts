import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { ApiError, badRequest, conflict, notFound } from "./errors";
import {
  bookingSchema,
  createBookingRequestSchema,
  createEventTypeRequestSchema,
  errorSchema,
  eventTypeSchema,
  slotSchema,
} from "./schemas";
import { createStore } from "./store";
import { generateSlots, isValidDateInput, parseDateTime, toDateInputValue } from "./time";
import type {
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  Slot,
  Store,
} from "./types";

type EventTypeParams = {
  eventTypeId: string;
};

type SlotsQuery = {
  date: string;
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
}

function findEventType(store: Store, eventTypeId: string): EventType | null {
  return store.eventTypes.find((eventType) => eventType.id === eventTypeId) ?? null;
}

function listSlotsForEventType(store: Store, eventType: EventType, date: string): Slot[] {
  const bookedStartTimes = new Set(store.bookings.map((booking) => booking.startTime));

  return generateSlots(date, eventType.durationMinutes).map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    available: !bookedStartTimes.has(slot.startTime),
  }));
}
