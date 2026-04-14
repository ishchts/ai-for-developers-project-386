import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../backend/app";
import { createStore, defaultEventTypes, ensureDefaultEventTypes } from "../backend/store";
import type { CreateEventTypeRequest } from "../backend/types";

test("GET /healthz returns 200", async (t) => {
  const app = buildApp({
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/healthz",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    status: "ok",
  });
});

test("POST /api/owner/event-types creates an event type", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "POST",
    url: "/api/owner/event-types",
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

test("POST /api/owner/event-types returns contract-shaped 400 on invalid input", async (t) => {
  const app = buildApp({
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "POST",
    url: "/api/owner/event-types",
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

test("GET /api/event-types returns created event types", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
    staticRoot: null,
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
    url: "/api/event-types",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), [
    ...defaultEventTypes,
    {
      id: "event-1",
      title: "Consultation",
      description: "Detailed session",
      durationMinutes: 60,
    },
  ]);
});

test("GET /api/event-types returns seeded default event types on empty startup", async (t) => {
  const app = buildApp({
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/event-types",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), defaultEventTypes);
});

test("createStore seeds defaults only once for the same store", () => {
  const store = createStore();

  assert.equal(store.eventTypes.length, 3);

  ensureDefaultEventTypes(store);

  assert.equal(store.eventTypes.length, 3);
  assert.deepEqual(store.eventTypes, defaultEventTypes);
});

test("seed does not modify a non-empty store", async (t) => {
  const store = {
    eventTypes: [
      {
        id: "custom-event",
        title: "Кастомная встреча",
        description: "Только пользовательские данные.",
        durationMinutes: 60,
      },
    ],
    bookings: [],
  };

  ensureDefaultEventTypes(store);

  const app = buildApp({
    store,
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/event-types",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), store.eventTypes);
  assert.equal(response.json().length, 1);
});

test("GET /api/event-types/:eventTypeId/slots returns 404 for unknown event type", async (t) => {
  const app = buildApp({
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/event-types/missing/slots?date=2026-04-10",
  });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.json(), {
    code: "NOT_FOUND",
    message: "Event type not found.",
  });
});

test("GET /api/event-types/:eventTypeId/slots returns 400 for invalid date", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
    staticRoot: null,
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
    url: "/api/event-types/event-1/slots?date=2026-02-31",
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().code, "BAD_REQUEST");
});

test("GET /api/event-types/:eventTypeId/slots returns deterministic slots and availability", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
    staticRoot: null,
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
    url: "/api/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "2026-04-10T09:00:00.000Z",
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/event-types/id-1/slots?date=2026-04-10",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().slice(0, 3), [
    {
      startTime: "2026-04-10T09:00:00.000Z",
      endTime: "2026-04-10T10:00:00.000Z",
      available: false,
    },
    {
      startTime: "2026-04-10T09:05:00.000Z",
      endTime: "2026-04-10T10:05:00.000Z",
      available: true,
    },
    {
      startTime: "2026-04-10T09:10:00.000Z",
      endTime: "2026-04-10T10:10:00.000Z",
      available: true,
    },
  ]);
});

test("POST /api/bookings validates required data and slot membership", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
    staticRoot: null,
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
    url: "/api/bookings",
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
    url: "/api/bookings",
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

test("POST /api/bookings returns 404 for unknown event type", async (t) => {
  const app = buildApp({
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "POST",
    url: "/api/bookings",
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

test("POST /api/bookings returns 409 for the same slot across event types", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
    staticRoot: null,
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
    url: "/api/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "2026-04-10T09:00:00.000Z",
    },
  });

  const second = await app.inject({
    method: "POST",
    url: "/api/bookings",
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

test("GET /api/owner/bookings returns only future bookings sorted by start time", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
    getNow: () => new Date("2026-04-10T10:30:00.000Z"),
    staticRoot: null,
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
    url: "/api/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Past",
      guestEmail: "past@example.com",
      startTime: "2026-04-10T09:00:00.000Z",
    },
  });

  await app.inject({
    method: "POST",
    url: "/api/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Future A",
      guestEmail: "future-a@example.com",
      startTime: "2026-04-10T11:00:00.000Z",
    },
  });

  await app.inject({
    method: "POST",
    url: "/api/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Future B",
      guestEmail: "future-b@example.com",
      startTime: "2026-04-10T12:00:00.000Z",
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/owner/bookings",
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

test("GET /api/owner/bookings/search paginates upcoming bookings", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
    getNow: () => new Date("2026-04-10T10:30:00.000Z"),
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 30,
  });

  for (const [index, startTime] of [
    "2026-04-10T11:00:00.000Z",
    "2026-04-10T11:05:00.000Z",
    "2026-04-10T11:10:00.000Z",
  ].entries()) {
    await app.inject({
      method: "POST",
      url: "/api/bookings",
      payload: {
        eventTypeId: "id-1",
        guestName: startTime,
        guestEmail: `upcoming-${index}@example.com`,
        startTime,
      },
    });
  }

  const response = await app.inject({
    method: "GET",
    url: "/api/owner/bookings/search?status=upcoming&page=2&pageSize=2",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().page, 2);
  assert.deepEqual(response.json().pageSize, 2);
  assert.deepEqual(response.json().totalItems, 3);
  assert.deepEqual(response.json().totalPages, 2);
  assert.deepEqual(response.json().items.map((booking: { guestName: string }) => booking.guestName), [
    "2026-04-10T11:10:00.000Z",
  ]);
});

test("GET /api/owner/bookings/search returns past bookings sorted descending", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
    getNow: () => new Date("2026-04-10T12:00:00.000Z"),
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 30,
  });

  for (const [index, startTime] of [
    "2026-04-10T09:00:00.000Z",
    "2026-04-10T10:00:00.000Z",
  ].entries()) {
    await app.inject({
      method: "POST",
      url: "/api/bookings",
      payload: {
        eventTypeId: "id-1",
        guestName: startTime,
        guestEmail: `past-${index}@example.com`,
        startTime,
      },
    });
  }

  const response = await app.inject({
    method: "GET",
    url: "/api/owner/bookings/search?status=past&page=1&pageSize=10",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().items.map((booking: { guestName: string }) => booking.guestName), [
    "2026-04-10T10:00:00.000Z",
    "2026-04-10T09:00:00.000Z",
  ]);
});

test("DELETE /api/owner/bookings/:bookingId deletes a booking", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 30,
  });

  await app.inject({
    method: "POST",
    url: "/api/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "2026-04-10T11:00:00.000Z",
    },
  });

  const response = await app.inject({
    method: "DELETE",
    url: "/api/owner/bookings/id-2",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().id, "id-2");

  const listResponse = await app.inject({
    method: "GET",
    url: "/api/owner/bookings/search?status=upcoming&page=1&pageSize=10",
  });

  assert.equal(listResponse.json().items.length, 0);
});

test("PATCH /api/owner/bookings/:bookingId updates booking fields and time", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 30,
  });

  await app.inject({
    method: "POST",
    url: "/api/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "2026-04-10T11:00:00.000Z",
    },
  });

  const response = await app.inject({
    method: "PATCH",
    url: "/api/owner/bookings/id-2",
    payload: {
      guestName: "Ada Lovelace",
      guestEmail: "adalovelace@example.com",
      startTime: "2026-04-10T11:05:00.000Z",
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().guestName, "Ada Lovelace");
  assert.equal(response.json().guestEmail, "adalovelace@example.com");
  assert.equal(response.json().startTime, "2026-04-10T11:05:00.000Z");
  assert.equal(response.json().endTime, "2026-04-10T11:35:00.000Z");
});

test("PATCH /api/owner/event-types/:eventTypeId updates an event type", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 30,
  });

  const response = await app.inject({
    method: "PATCH",
    url: "/api/owner/event-types/event-1",
    payload: {
      title: "Updated consultation",
      durationMinutes: 45,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    id: "event-1",
    title: "Updated consultation",
    description: "Detailed session",
    durationMinutes: 45,
  });
});

test("DELETE /api/owner/event-types/:eventTypeId blocks deletion when bookings exist", async (t) => {
  let idCounter = 0;
  const app = buildApp({
    createId: () => `id-${++idCounter}`,
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 30,
  });

  await app.inject({
    method: "POST",
    url: "/api/bookings",
    payload: {
      eventTypeId: "id-1",
      guestName: "Ada",
      guestEmail: "ada@example.com",
      startTime: "2026-04-10T11:00:00.000Z",
    },
  });

  const response = await app.inject({
    method: "DELETE",
    url: "/api/owner/event-types/id-1",
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), {
    code: "BAD_REQUEST",
    message: "Cannot delete an event type with existing bookings.",
  });
});

test("DELETE /api/owner/event-types/:eventTypeId deletes an unused event type", async (t) => {
  const app = buildApp({
    createId: () => "event-1",
    staticRoot: null,
  });

  t.after(async () => {
    await app.close();
  });

  await createEventType(app, {
    title: "Consultation",
    description: "Detailed session",
    durationMinutes: 30,
  });

  const response = await app.inject({
    method: "DELETE",
    url: "/api/owner/event-types/event-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().id, "event-1");
});

test("GET /api/does-not-exist returns JSON 404 instead of SPA HTML", async (t) => {
  const app = buildApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/does-not-exist",
  });

  assert.equal(response.statusCode, 404);
  assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
  assert.deepEqual(response.json(), {
    code: "NOT_FOUND",
    message: "Route GET /api/does-not-exist not found.",
  });
});

test("GET /event-types no longer exposes a legacy root API route", async (t) => {
  const app = buildApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/event-types",
  });

  assert.equal(response.statusCode, 404);
  assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
  assert.deepEqual(response.json(), {
    code: "NOT_FOUND",
    message: "Route GET /event-types not found.",
  });
});

test("GET /admin returns SPA index without affecting API routing", async (t) => {
  const staticRoot = await fs.mkdtemp(path.join(os.tmpdir(), "call-booking-static-"));

  await fs.writeFile(
    path.join(staticRoot, "index.html"),
    "<!doctype html><html><body><div id=\"root\">spa</div></body></html>",
    "utf8",
  );

  const app = buildApp({
    staticRoot,
  });

  t.after(async () => {
    await app.close();
    await fs.rm(staticRoot, { recursive: true, force: true });
  });

  const response = await app.inject({
    method: "GET",
    url: "/admin",
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["content-type"] ?? "", /^text\/html/);
  assert.match(response.body, /<div id="root">spa<\/div>/);
});

async function createEventType(
  app: FastifyInstance,
  payload: CreateEventTypeRequest,
): Promise<void> {
  const response = await app.inject({
    method: "POST",
    url: "/api/owner/event-types",
    payload,
  });

  assert.equal(response.statusCode, 201);
}
