import assert from "node:assert/strict";
import test from "node:test";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../backend/app";
import type { CreateEventTypeRequest } from "../backend/types";

test("POST /owner/event-types creates an event type", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "POST",
    url: "/owner/event-types",
    payload: {
      title: "Intro call",
      description: "Short introduction",
      durationMinutes: 30,
    },
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), {
    id: "event-1",
    title: "Intro call",
    description: "Short introduction",
    durationMinutes: 30,
  });
});

test("POST /owner/event-types returns contract-shaped 400 on invalid input", async (t) => {
  const app = buildApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "POST",
    url: "/owner/event-types",
    payload: {
      title: "",
      description: "Invalid",
      durationMinutes: 0,
    },
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(Object.keys(response.json()).sort(), ["code", "message"]);
  assert.equal(response.json().code, "BAD_REQUEST");
});

test("GET /event-types returns created event types", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
  });

  t.after(async () => {
    await app.close();
  });

  await app.inject({
    method: "POST",
    url: "/owner/event-types",
    payload: {
      title: "Consultation",
      description: "Detailed session",
      durationMinutes: 60,
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/event-types",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), [
    {
      id: "event-1",
      title: "Consultation",
      description: "Detailed session",
      durationMinutes: 60,
    },
  ]);
});

test("GET /event-types/:eventTypeId/slots returns 404 for unknown event type", async (t) => {
  const app = buildApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/event-types/missing/slots?date=2026-04-10",
  });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.json(), {
    code: "NOT_FOUND",
    message: "Event type not found.",
  });
});

test("GET /event-types/:eventTypeId/slots returns 400 for invalid date", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 60,
  });

  const response = await app.inject({
    method: "GET",
    url: "/event-types/event-1/slots?date=2026-02-31",
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().code, "BAD_REQUEST");
});

test("GET /event-types/:eventTypeId/slots returns deterministic slots and availability", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 60,
  });

  await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "2026-04-10T09:00:00.000Z",
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/event-types/id-1/slots?date=2026-04-10",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().slice(0, 3), [
    {
      startTime: "2026-04-10T09:00:00.000Z",
      endTime: "2026-04-10T10:00:00.000Z",
      available: false,
    },
    {
      startTime: "2026-04-10T10:00:00.000Z",
      endTime: "2026-04-10T11:00:00.000Z",
      available: true,
    },
    {
      startTime: "2026-04-10T11:00:00.000Z",
      endTime: "2026-04-10T12:00:00.000Z",
      available: true,
    },
  ]);
});

test("POST /bookings validates required data and slot membership", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 60,
  });

  const invalidDateTime = await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      eventTypeId: "event-1",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "not-a-date",
    },
  });

  assert.equal(invalidDateTime.statusCode, 400);
  assert.equal(invalidDateTime.json().code, "BAD_REQUEST");

  const invalidSlot = await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      eventTypeId: "event-1",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "2026-04-10T08:00:00.000Z",
    },
  });

  assert.equal(invalidSlot.statusCode, 400);
  assert.equal(invalidSlot.json().code, "BAD_REQUEST");
});

test("POST /bookings returns 404 for unknown event type", async (t) => {
  const app = buildApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      eventTypeId: "missing",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "2026-04-10T09:00:00.000Z",
    },
  });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.json(), {
    code: "NOT_FOUND",
    message: "Event type not found.",
  });
});

test("POST /bookings returns 409 for the same slot across event types", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Short call",
    description: "30 min",
    durationMinutes: 30,
  });

  await createEventType(app, {
    title: "Long call",
    description: "60 min",
    durationMinutes: 60,
  });

  const first = await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "2026-04-10T09:00:00.000Z",
    },
  });

  const second = await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      eventTypeId: "id-2",
      guestName: "Grace",
      guestEmail: "grace@example.com",
      startTime: "2026-04-10T09:00:00.000Z",
    },
  });

  assert.equal(first.statusCode, 201);
  assert.equal(second.statusCode, 409);
  assert.deepEqual(second.json(), {
    code: "TIME_SLOT_CONFLICT",
    message: "This time slot is already booked.",
  });
});

test("GET /owner/bookings returns only future bookings sorted by start time", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
    getNow: () => new Date("2026-04-10T10:30:00.000Z"),
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 60,
  });

  await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Past",
      guestEmail: "past@example.com",
      startTime: "2026-04-10T09:00:00.000Z",
    },
  });

  await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Future A",
      guestEmail: "future-a@example.com",
      startTime: "2026-04-10T11:00:00.000Z",
    },
  });

  await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Future B",
      guestEmail: "future-b@example.com",
      startTime: "2026-04-10T12:00:00.000Z",
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/owner/bookings",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    response.json().map((booking: { guestName: string }) => booking.guestName),
    ["Future A", "Future B"],
  );
  assert.deepEqual(
    response.json().map((booking: { endTime: string }) => booking.endTime),
    ["2026-04-10T12:00:00.000Z", "2026-04-10T13:00:00.000Z"],
  );
});

async function createEventType(
  app: FastifyInstance,
  payload: CreateEventTypeRequest,
): Promise<void> {
  const response = await app.inject({
    method: "POST",
    url: "/owner/event-types",
    payload,
  });

  assert.equal(response.statusCode, 201);
}
