import type { EventType, Store } from "./types";

export const defaultEventTypes: EventType[] = [
  {
    id: "default-15-minutes",
    title: "15 минут",
    description: "Короткая встреча на 15 минут.",
    durationMinutes: 15,
  },
  {
    id: "default-30-minutes",
    title: "30 минут",
    description: "Стандартная встреча на 30 минут.",
    durationMinutes: 30,
  },
  {
    id: "default-45-minutes",
    title: "45 минут",
    description: "Расширенная встреча на 45 минут.",
    durationMinutes: 45,
  },
];

export function ensureDefaultEventTypes(store: Store): Store {
  if (store.eventTypes.length === 0) {
    store.eventTypes.push(...defaultEventTypes.map((eventType) => ({ ...eventType })));
  }

  return store;
}

export function createStore(): Store {
  return ensureDefaultEventTypes({
    eventTypes: [],
    bookings: [],
  });
}
