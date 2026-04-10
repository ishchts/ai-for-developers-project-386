import type { Store } from "./types";

export function createStore(): Store {
  return {
    eventTypes: [],
    bookings: [],
  };
}
