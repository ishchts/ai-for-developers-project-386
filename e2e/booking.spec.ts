import { expect, test } from "@playwright/test";
import {
  createEventType,
  dateFromToday,
  fillBookingForm,
  openBookingPage,
  selectFirstAvailableSlot,
  selectSlotByLabel,
} from "./helpers/booking";

test("happy path creates a booking and shows it in admin", async ({ page, request }) => {
  const eventType = await createEventType(request, {
    title: `Strategy Session ${Date.now()}`,
  });
  const bookingDate = dateFromToday(1);
  const guestName = `Alice Example ${Date.now()}`;
  const guestEmail = `alice.${Date.now()}@example.com`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: eventType.title })).toBeVisible();
  await page
    .getByTestId("event-card")
    .filter({ hasText: eventType.title })
    .getByTestId("event-card-cta")
    .click();

  await page.getByTestId("booking-date-input").fill(bookingDate);
  const selectedSlotLabel = await selectFirstAvailableSlot(page);
  await fillBookingForm(page, { guestName, guestEmail });
  await page.getByTestId("booking-confirm-button").click();

  await expect(page.getByTestId("booking-success-card")).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Будущие бронирования", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Обновить" }).click();

  const bookingRow = page.locator(".booking-row").filter({ hasText: guestEmail });
  await expect(bookingRow).toContainText(guestName);
  await expect(bookingRow).toContainText(guestEmail);
  await expect(bookingRow).toContainText(eventType.title);
  await expect(bookingRow.getByText(selectedSlotLabel, { exact: false })).toBeVisible();
});

test("conflict path shows slot conflict for a stale second page", async ({
  browser,
  request,
}) => {
  const eventType = await createEventType(request, {
    title: `Conflict Session ${Date.now()}`,
  });
  const bookingDate = dateFromToday(2);
  const firstGuestName = `First Guest ${Date.now()}`;
  const firstGuestEmail = `first.${Date.now()}@example.com`;
  const secondGuestName = `Second Guest ${Date.now()}`;
  const secondGuestEmail = `second.${Date.now()}@example.com`;

  const firstContext = await browser.newContext({ timezoneId: "UTC" });
  const secondContext = await browser.newContext({ timezoneId: "UTC" });
  const firstPage = await firstContext.newPage();
  const secondPage = await secondContext.newPage();

  await openBookingPage(firstPage, eventType.id, bookingDate);
  const selectedSlotLabel = await selectFirstAvailableSlot(firstPage);
  await fillBookingForm(firstPage, {
    guestName: firstGuestName,
    guestEmail: firstGuestEmail,
  });

  await openBookingPage(secondPage, eventType.id, bookingDate);
  await selectSlotByLabel(secondPage, selectedSlotLabel);
  await fillBookingForm(secondPage, {
    guestName: secondGuestName,
    guestEmail: secondGuestEmail,
  });

  await firstPage.getByTestId("booking-confirm-button").click();
  await expect(firstPage.getByTestId("booking-success-card")).toBeVisible();

  await secondPage.getByTestId("booking-confirm-button").click();
  await expect(secondPage.getByText("Этот слот уже занят")).toBeVisible();
  await expect(secondPage.getByText("This time slot is already booked.")).toBeVisible();

  await firstContext.close();
  await secondContext.close();
});
