import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";

const backendBaseUrl = "http://127.0.0.1:18080";

type EventTypeSeed = {
  title?: string;
  description?: string;
  durationMinutes?: number;
};

type BookingFormData = {
  guestName: string;
  guestEmail: string;
};

type BookingSeed = BookingFormData & {
  eventTypeId: string;
  startTime: string;
};

type CreatedEventType = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
};

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function dateFromToday(offsetDays = 1): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);

  return date.toISOString().slice(0, 10);
}

export async function createEventType(
  request: APIRequestContext,
  overrides: EventTypeSeed = {},
): Promise<CreatedEventType> {
  const suffix = uniqueSuffix();
  const response = await request.post(`${backendBaseUrl}/api/owner/event-types`, {
    data: {
      title: overrides.title ?? `Discovery Call ${suffix}`,
      description: overrides.description ?? `Introductory booking flow ${suffix}`,
      durationMinutes: overrides.durationMinutes ?? 30,
    },
  });

  expect(response.ok()).toBeTruthy();

  return (await response.json()) as CreatedEventType;
}

export async function createBooking(
  request: APIRequestContext,
  data: BookingSeed,
): Promise<void> {
  const response = await request.post(`${backendBaseUrl}/api/bookings`, {
    data,
  });

  expect(response.ok()).toBeTruthy();
}

export async function openBookingPage(
  page: Page,
  eventTypeId: string,
  date: string,
): Promise<void> {
  await page.goto(`/book/${eventTypeId}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByTestId("booking-date-input").fill(date);
  await expect(page.getByTestId("slot-list")).toBeVisible();
}

async function firstAvailableSlot(page: Page): Promise<Locator> {
  const buttons = page.getByTestId("slot-button");
  await expect(buttons.first()).toBeVisible();
  return buttons.first();
}

export async function selectFirstAvailableSlot(page: Page): Promise<string> {
  const slot = await firstAvailableSlot(page);
  const label = (await slot.textContent())?.trim();

  if (!label) {
    throw new Error("Expected available slot button to have visible text.");
  }

  await slot.click();
  await expect(page.getByTestId("booking-details-form")).toBeVisible();

  return label;
}

export async function selectSlotByLabel(page: Page, label: string): Promise<void> {
  await page.getByTestId("slot-button").getByText(label, { exact: true }).click();
}

export async function fillBookingForm(page: Page, data: BookingFormData): Promise<void> {
  await page.getByTestId("booking-name-input").fill(data.guestName);
  await page.getByTestId("booking-email-input").fill(data.guestEmail);
}
