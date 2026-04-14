export const errorSchema = {
  type: "object",
  required: ["code", "message"],
  properties: {
    code: { type: "string" },
    message: { type: "string" },
  },
} as const;

export const eventTypeSchema = {
  type: "object",
  required: ["id", "title", "description", "durationMinutes"],
  properties: {
    id: { type: "string" },
    title: { type: "string", minLength: 1 },
    description: { type: "string" },
    durationMinutes: { type: "integer", minimum: 1 },
  },
} as const;

export const createEventTypeRequestSchema = {
  type: "object",
  required: ["title", "description", "durationMinutes"],
  properties: {
    title: { type: "string", minLength: 1 },
    description: { type: "string" },
    durationMinutes: { type: "integer", minimum: 1 },
  },
} as const;

export const updateEventTypeRequestSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 1 },
    description: { type: "string" },
    durationMinutes: { type: "integer", minimum: 1 },
  },
} as const;

export const bookingSchema = {
  type: "object",
  required: ["id", "eventTypeId", "guestName", "guestEmail", "startTime", "endTime"],
  properties: {
    id: { type: "string" },
    eventTypeId: { type: "string" },
    guestName: { type: "string", minLength: 1 },
    guestEmail: { type: "string", format: "email" },
    startTime: { type: "string", format: "date-time" },
    endTime: { type: "string", format: "date-time" },
  },
} as const;

export const createBookingRequestSchema = {
  type: "object",
  required: ["eventTypeId", "guestName", "guestEmail", "startTime"],
  properties: {
    eventTypeId: { type: "string" },
    guestName: { type: "string", minLength: 1 },
    guestEmail: { type: "string", format: "email" },
    startTime: { type: "string", format: "date-time" },
  },
} as const;

export const updateBookingRequestSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    eventTypeId: { type: "string" },
    guestName: { type: "string", minLength: 1 },
    guestEmail: { type: "string", format: "email" },
    startTime: { type: "string", format: "date-time" },
  },
} as const;

export const slotSchema = {
  type: "object",
  required: ["startTime", "endTime", "available"],
  properties: {
    startTime: { type: "string", format: "date-time" },
    endTime: { type: "string", format: "date-time" },
    available: { type: "boolean" },
  },
} as const;

export const paginatedBookingsSchema = {
  type: "object",
  required: ["items", "page", "pageSize", "totalItems", "totalPages"],
  properties: {
    items: {
      type: "array",
      items: bookingSchema,
    },
    page: { type: "integer", minimum: 1 },
    pageSize: { type: "integer", minimum: 1 },
    totalItems: { type: "integer", minimum: 0 },
    totalPages: { type: "integer", minimum: 0 },
  },
} as const;
