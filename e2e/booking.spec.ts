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
    .locator("article")
    .filter({ hasText: eventType.title })
    .getByRole("link", { name: "Continue" })
    .click();

  await page.getByLabel("Date").fill(bookingDate);
  const selectedSlotLabel = await selectFirstAvailableSlot(page);
  await fillBookingForm(page, { guestName, guestEmail });
  await page.getByRole("button", { name: "Book now" }).click();

  await expect(page.getByRole("heading", { name: "Booking created" })).toBeVisible();
  await expect(page.getByText("Confirmed for", { exact: false })).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Future bookings", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Refresh" }).click();

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

  await firstPage.getByRole("button", { name: "Book now" }).click();
  await expect(firstPage.getByRole("heading", { name: "Booking created" })).toBeVisible();

  await secondPage.getByRole("button", { name: "Book now" }).click();
  await expect(secondPage.getByRole("heading", { name: "Slot conflict" })).toBeVisible();
  await expect(secondPage.getByText("This time slot is already booked.")).toBeVisible();

  await firstContext.close();
  await secondContext.close();
});
