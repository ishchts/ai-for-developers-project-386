import type { Slot } from "./types";

export const SLOT_WINDOW_START_MINUTES = 9 * 60;
export const SLOT_WINDOW_END_MINUTES = 18 * 60;
export const SLOT_STEP_MINUTES = 5;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateInput(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const candidate = new Date(year, month - 1, day);

  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  );
}

export function parseDateTime(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createSlotDate(dateInput: string, minutesFromMidnight: number): Date {
  const [yearText, monthText, dayText] = dateInput.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function generateSlots(dateInput: string, durationMinutes: number): Slot[] {
  const slots: Slot[] = [];

  for (
    let startMinutes = SLOT_WINDOW_START_MINUTES;
    startMinutes + durationMinutes <= SLOT_WINDOW_END_MINUTES;
    startMinutes += SLOT_STEP_MINUTES
  ) {
    const start = createSlotDate(dateInput, startMinutes);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    slots.push({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      available: true,
    });
  }

  return slots;
}
