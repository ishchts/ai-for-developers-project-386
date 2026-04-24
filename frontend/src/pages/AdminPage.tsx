import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { BookingDeleteDialog } from "../components/admin/BookingDeleteDialog";
import { BookingDialog } from "../components/admin/BookingDialog";
import { EventTypeDeleteDialog } from "../components/admin/EventTypeDeleteDialog";
import { EventTypeDialog } from "../components/admin/EventTypeDialog";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { InlineMessage } from "../components/common/InlineMessage";
import { SectionIntro } from "../components/common/SectionIntro";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../lib/api";
import { formatDateTime } from "../lib/datetime";
import {
  ApiError,
  type Booking,
  type BookingStatus,
  type EventType,
} from "../types/api";

const DEFAULT_BOOKINGS_PAGE_SIZE = 5;

type AdminSection = "bookings" | "event-types";

type FeedbackState = {
  tone: "success" | "error";
  title: string;
  message: string;
} | null;

type EventTypeFormState = {
  visible: boolean;
  mode: "create" | "edit";
  eventTypeId: string | null;
  title: string;
  description: string;
  durationMinutes: string;
  errors: Partial<Record<"title" | "durationMinutes", string>>;
  submitError: string | null;
  isSubmitting: boolean;
};

type BookingFormState = {
  visible: boolean;
  bookingId: string | null;
  guestName: string;
  guestEmail: string;
  eventTypeId: string;
  startTime: string;
  errors: Partial<Record<"guestName" | "guestEmail" | "eventTypeId" | "startTime", string>>;
  isSubmitting: boolean;
};

const hiddenEventTypeForm: EventTypeFormState = {
  visible: false,
  mode: "create",
  eventTypeId: null,
  title: "",
  description: "",
  durationMinutes: "30",
  errors: {},
  submitError: null,
  isSubmitting: false,
};

const hiddenBookingForm: BookingFormState = {
  visible: false,
  bookingId: null,
  guestName: "",
  guestEmail: "",
  eventTypeId: "",
  startTime: "",
  errors: {},
  isSubmitting: false,
};

export function AdminPage() {
  const { i18n, t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [eventTypeForm, setEventTypeForm] = useState<EventTypeFormState>(hiddenEventTypeForm);
  const [bookingForm, setBookingForm] = useState<BookingFormState>(hiddenBookingForm);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [bookingDeleteError, setBookingDeleteError] = useState<string | null>(null);
  const [isDeletingBooking, setIsDeletingBooking] = useState(false);
  const [eventTypeToDelete, setEventTypeToDelete] = useState<EventType | null>(null);
  const [eventTypeDeleteError, setEventTypeDeleteError] = useState<string | null>(null);
  const [isDeletingEventType, setIsDeletingEventType] = useState(false);

  const section = (searchParams.get("section") as AdminSection | null) ?? "bookings";
  const bookingTab = (searchParams.get("bookingTab") as BookingStatus | null) ?? "upcoming";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const currentPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const {
    data: eventTypes,
    error: eventTypesError,
    isLoading: isEventTypesLoading,
    reload: reloadEventTypes,
  } = useAsyncData(() => api.listEventTypes(), []);

  const {
    data: bookingsPage,
    error: bookingsError,
    isLoading: isBookingsLoading,
    reload: reloadBookings,
  } = useAsyncData(
    () => api.searchBookings(bookingTab, currentPage, DEFAULT_BOOKINGS_PAGE_SIZE),
    [bookingTab, currentPage],
  );

  const eventTypeTitles = useMemo(
    () => new Map((eventTypes ?? []).map((eventType) => [eventType.id, eventType.title])),
    [eventTypes],
  );

  function updateSearch(next: Record<string, string>) {
    const updated = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(next)) {
      updated.set(key, value);
    }

    setSearchParams(updated);
  }

  function switchSection(nextSection: AdminSection) {
    const updated = new URLSearchParams(searchParams);
    updated.set("section", nextSection);
    if (nextSection === "bookings") {
      updated.set("bookingTab", bookingTab);
      updated.set("page", "1");
    } else {
      updated.delete("bookingTab");
      updated.delete("page");
    }
    setSearchParams(updated);
    setFeedback(null);
  }

  function switchBookingTab(nextStatus: BookingStatus) {
    updateSearch({
      section: "bookings",
      bookingTab: nextStatus,
      page: "1",
    });
    setFeedback(null);
  }

  function switchPage(nextPage: number) {
    updateSearch({
      section: "bookings",
      bookingTab,
      page: String(nextPage),
    });
  }

  function mapAdminError(error: unknown, action: "save" | "delete"): string {
    if (error instanceof ApiError) {
      const message = error.payload?.message ?? "";

      if (error.status === 409) {
        return t("admin.errors.bookingConflict");
      }

      if (error.status === 404 && message === "Booking not found.") {
        return t("admin.errors.bookingNotFound");
      }

      if (error.status === 404 && message === "Event type not found.") {
        return t("admin.errors.eventTypeNotFound");
      }

      if (error.status === 400 && message === "Cannot delete an event type with existing bookings.") {
        return t("admin.errors.eventTypeDeleteBlocked");
      }

      if (
        error.status === 400 &&
        message.includes("must match an available generated slot")
      ) {
        return t("admin.errors.bookingConflict");
      }
    }

    return t(action === "save" ? "admin.errors.genericSave" : "admin.errors.genericDelete");
  }

  function validateEventTypeDraft(draft: EventTypeFormState) {
    const errors: EventTypeFormState["errors"] = {};

    if (!draft.title.trim()) {
      errors.title = t("admin.validation.titleRequired");
    }

    const duration = Number(draft.durationMinutes);
    if (!Number.isInteger(duration) || duration < 1) {
      errors.durationMinutes = t("admin.validation.durationInvalid");
    }

    return errors;
  }

  function validateBookingDraft(draft: BookingFormState) {
    const errors: BookingFormState["errors"] = {};

    if (!draft.guestName.trim()) {
      errors.guestName = t("admin.validation.guestNameRequired");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.guestEmail.trim())) {
      errors.guestEmail = t("admin.validation.guestEmailInvalid");
    }

    if (!draft.eventTypeId) {
      errors.eventTypeId = t("admin.validation.eventTypeRequired");
    }

    if (!draft.startTime) {
      errors.startTime = t("admin.validation.startTimeRequired");
    }

    return errors;
  }

  function openCreateEventType() {
    setEventTypeForm({
      ...hiddenEventTypeForm,
      visible: true,
      mode: "create",
    });
    setFeedback(null);
  }

  function openEditEventType(eventType: EventType) {
    setEventTypeForm({
      visible: true,
      mode: "edit",
      eventTypeId: eventType.id,
      title: eventType.title,
      description: eventType.description,
      durationMinutes: String(eventType.durationMinutes),
      errors: {},
      submitError: null,
      isSubmitting: false,
    });
    setFeedback(null);
  }

  function closeEventTypeEditor() {
    setEventTypeForm(hiddenEventTypeForm);
  }

  function openDeleteEventType(eventType: EventType) {
    setEventTypeToDelete(eventType);
    setEventTypeDeleteError(null);
  }

  function closeDeleteEventTypeDialog() {
    setEventTypeToDelete(null);
    setEventTypeDeleteError(null);
    setIsDeletingEventType(false);
  }

  function openEditBooking(booking: Booking) {
    setBookingForm({
      visible: true,
      bookingId: booking.id,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      eventTypeId: booking.eventTypeId,
      startTime: toDateTimeLocalValue(booking.startTime),
      errors: {},
      isSubmitting: false,
    });
    setFeedback(null);
  }

  function closeBookingEditor() {
    setBookingForm(hiddenBookingForm);
  }

  function openDeleteBooking(booking: Booking) {
    setBookingToDelete(booking);
    setBookingDeleteError(null);
  }

  function closeDeleteBookingDialog() {
    setBookingToDelete(null);
    setBookingDeleteError(null);
    setIsDeletingBooking(false);
  }

  async function handleSubmitEventType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateEventTypeDraft(eventTypeForm);

    if (Object.keys(errors).length > 0) {
      setEventTypeForm((current) => ({
        ...current,
        errors,
        submitError: null,
      }));
      return;
    }

    setEventTypeForm((current) => ({
      ...current,
      errors: {},
      submitError: null,
      isSubmitting: true,
    }));

    try {
      if (eventTypeForm.mode === "edit" && eventTypeForm.eventTypeId) {
        await api.updateEventType(eventTypeForm.eventTypeId, {
          title: eventTypeForm.title.trim(),
          description: eventTypeForm.description.trim(),
          durationMinutes: Number(eventTypeForm.durationMinutes),
        });
      } else {
        await api.createEventType({
          title: eventTypeForm.title.trim(),
          description: eventTypeForm.description.trim(),
          durationMinutes: Number(eventTypeForm.durationMinutes),
        });
      }

      await reloadEventTypes();
      setEventTypeForm(hiddenEventTypeForm);
      toast.success(
        eventTypeForm.mode === "edit"
          ? t("admin.updateSuccessTitle")
          : t("admin.createSuccessTitle"),
        {
          description:
            eventTypeForm.mode === "edit"
              ? t("admin.updateSuccessMessage")
              : t("admin.createSuccessMessage", { title: eventTypeForm.title.trim() }),
        },
      );
    } catch (error) {
      setEventTypeForm((current) => ({
        ...current,
        isSubmitting: false,
        submitError: mapAdminError(error, "save"),
      }));
      return;
    }
  }

  async function handleSubmitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateBookingDraft(bookingForm);

    if (Object.keys(errors).length > 0) {
      setBookingForm((current) => ({
        ...current,
        errors,
      }));
      return;
    }

    if (!bookingForm.bookingId) {
      return;
    }

    setBookingForm((current) => ({
      ...current,
      errors: {},
      isSubmitting: true,
    }));

    try {
      await api.updateBooking(bookingForm.bookingId, {
        guestName: bookingForm.guestName.trim(),
        guestEmail: bookingForm.guestEmail.trim(),
        eventTypeId: bookingForm.eventTypeId,
        startTime: fromDateTimeLocalValue(bookingForm.startTime),
      });
      await reloadBookings();
      setBookingForm(hiddenBookingForm);
      setFeedback({
        tone: "success",
        title: t("admin.updateSuccessTitle"),
        message: t("admin.updateSuccessMessage"),
      });
    } catch (error) {
      setBookingForm((current) => ({
        ...current,
        isSubmitting: false,
      }));
      setFeedback({
        tone: "error",
        title: t("admin.bookingsErrorTitle"),
        message: mapAdminError(error, "save"),
      });
    }
  }

  async function handleDeleteBooking() {
    if (!bookingToDelete) {
      return;
    }

    setIsDeletingBooking(true);
    setBookingDeleteError(null);

    try {
      await api.deleteBooking(bookingToDelete.id);
      await reloadBookings();
      closeDeleteBookingDialog();
      setFeedback({
        tone: "success",
        title: t("admin.deleteSuccessTitle"),
        message: t("admin.deleteSuccessMessage"),
      });
    } catch (error) {
      setIsDeletingBooking(false);
      setBookingDeleteError(mapAdminError(error, "delete"));
    }
  }

  async function handleDeleteEventType() {
    if (!eventTypeToDelete) {
      return;
    }

    setIsDeletingEventType(true);
    setEventTypeDeleteError(null);

    try {
      await api.deleteEventType(eventTypeToDelete.id);
      await reloadEventTypes();
      setEventTypeToDelete(null);
      setIsDeletingEventType(false);
      closeEventTypeEditor();
      toast.success(t("admin.deleteSuccessTitle"), {
        description: t("admin.deleteSuccessMessage"),
      });
    } catch (error) {
      setIsDeletingEventType(false);
      setEventTypeDeleteError(mapAdminError(error, "delete"));
    }
  }

  const bookingsTitle =
    bookingTab === "upcoming" ? t("admin.bookingsTitle") : t("admin.pastBookingsTitle");

  return (
    <section className="stack">
      <SectionIntro eyebrow={t("admin.eyebrow")} title={t("admin.title")} />

      <div className="admin-section-tabs" role="tablist">
        <button
          aria-selected={section === "bookings"}
          className={section === "bookings" ? "admin-section-tab is-active" : "admin-section-tab"}
          onClick={() => switchSection("bookings")}
          type="button"
        >
          {t("admin.sections.bookings")}
        </button>
        <button
          aria-selected={section === "event-types"}
          className={section === "event-types" ? "admin-section-tab is-active" : "admin-section-tab"}
          onClick={() => switchSection("event-types")}
          type="button"
        >
          {t("admin.sections.eventTypes")}
        </button>
      </div>

      {feedback ? (
        <InlineMessage message={feedback.message} title={feedback.title} tone={feedback.tone} />
      ) : null}

      {section === "bookings" ? (
        <div className="stack">
          <Card className="stack">
            <div className="section-head">
              <div className="stack compact">
                <h2>{bookingsTitle}</h2>
                <p>{t("admin.bookingsSubtitle")}</p>
              </div>
              <Button
                onClick={() => {
                  void reloadBookings();
                  void reloadEventTypes();
                }}
                variant="secondary"
              >
                {t("common.refresh")}
              </Button>
            </div>

            <div className="admin-section-tabs" role="tablist">
              <button
                aria-selected={bookingTab === "upcoming"}
                className={bookingTab === "upcoming" ? "admin-section-tab is-active" : "admin-section-tab"}
                onClick={() => switchBookingTab("upcoming")}
                type="button"
              >
                {t("admin.bookingTabs.upcoming")}
              </button>
              <button
                aria-selected={bookingTab === "past"}
                className={bookingTab === "past" ? "admin-section-tab is-active" : "admin-section-tab"}
                onClick={() => switchBookingTab("past")}
                type="button"
              >
                {t("admin.bookingTabs.past")}
              </button>
            </div>

            {isBookingsLoading || isEventTypesLoading ? (
              <InlineMessage message={t("admin.loadingMessage")} title={t("admin.loadingTitle")} />
            ) : null}

            {bookingsError ? (
              <InlineMessage message={bookingsError.message} title={t("admin.bookingsErrorTitle")} tone="error" />
            ) : null}

            {eventTypesError ? (
              <InlineMessage
                message={t("admin.eventTypesErrorMessage", { message: eventTypesError.message })}
                title={t("admin.eventTypesErrorTitle")}
                tone="warning"
              />
            ) : null}

            {bookingsPage ? (
              <div className="stack compact">
                {bookingsPage.items.length ? (
                  bookingsPage.items.map((booking) => (
                    <article className="booking-row admin-booking-row" key={booking.id}>
                      <div className="stack compact">
                        <strong>{booking.guestName}</strong>
                        <p>{booking.guestEmail}</p>
                        <p>
                          {t("admin.eventTypeLabel")}:{" "}
                          {eventTypeTitles.get(booking.eventTypeId) ?? booking.eventTypeId}
                        </p>
                      </div>
                      <div className="stack compact">
                        <strong>{formatDateTime(booking.startTime, i18n.language)}</strong>
                        <p>{t("admin.durationValue", {
                          duration:
                            (eventTypes ?? []).find((eventType) => eventType.id === booking.eventTypeId)
                              ?.durationMinutes ?? 0,
                        })}</p>
                        <div className="admin-inline-actions">
                          <Button onClick={() => openEditBooking(booking)} variant="secondary">
                            {t("admin.editCta")}
                          </Button>
                          <Button onClick={() => openDeleteBooking(booking)} variant="ghost">
                            {t("admin.deleteCta")}
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <InlineMessage
                    message={
                      bookingTab === "upcoming"
                        ? t("admin.noBookingsMessage")
                        : t("admin.noPastBookingsMessage")
                    }
                    title={
                      bookingTab === "upcoming"
                        ? t("admin.noBookingsTitle")
                        : t("admin.noPastBookingsTitle")
                    }
                  />
                )}
              </div>
            ) : null}

            {bookingsPage && bookingsPage.totalPages > 1 ? (
              <div className="admin-pagination">
                <Button
                  disabled={bookingsPage.page <= 1}
                  onClick={() => switchPage(bookingsPage.page - 1)}
                  variant="secondary"
                >
                  {t("admin.previousPage")}
                </Button>
                <span>{t("admin.pageInfo", { page: bookingsPage.page, totalPages: bookingsPage.totalPages })}</span>
                <Button
                  disabled={bookingsPage.page >= bookingsPage.totalPages}
                  onClick={() => switchPage(bookingsPage.page + 1)}
                  variant="secondary"
                >
                  {t("admin.nextPage")}
                </Button>
              </div>
            ) : null}

            {bookingsPage ? (
              <p className="meta">{t("admin.totalItems", { count: bookingsPage.totalItems })}</p>
            ) : null}
          </Card>

          <BookingDialog
            errors={bookingForm.errors}
            eventTypeId={bookingForm.eventTypeId}
            eventTypes={eventTypes ?? []}
            guestEmail={bookingForm.guestEmail}
            guestName={bookingForm.guestName}
            isSubmitting={bookingForm.isSubmitting}
            onEventTypeChange={(value) =>
              setBookingForm((current) => ({
                ...current,
                eventTypeId: value,
              }))
            }
            onGuestEmailChange={(value) =>
              setBookingForm((current) => ({
                ...current,
                guestEmail: value,
              }))
            }
            onGuestNameChange={(value) =>
              setBookingForm((current) => ({
                ...current,
                guestName: value,
              }))
            }
            onOpenChange={(open) => {
              if (!open) {
                closeBookingEditor();
              }
            }}
            onStartTimeChange={(value) =>
              setBookingForm((current) => ({
                ...current,
                startTime: value,
              }))
            }
            onSubmit={handleSubmitBooking}
            open={bookingForm.visible}
            startTime={bookingForm.startTime}
          />

          <BookingDeleteDialog
            guestName={bookingToDelete?.guestName ?? ""}
            isDeleting={isDeletingBooking}
            onConfirm={() => {
              void handleDeleteBooking();
            }}
            onOpenChange={(open) => {
              if (!open) {
                closeDeleteBookingDialog();
              }
            }}
            open={Boolean(bookingToDelete)}
            submitError={bookingDeleteError}
          />
        </div>
      ) : (
        <div className="stack">
          <Card className="stack">
            <div className="section-head">
              <div className="stack compact">
                <h2>{t("admin.eventTypesTitle")}</h2>
                <p>{t("admin.eventTypesSubtitle")}</p>
              </div>
              <Button onClick={openCreateEventType}>{t("admin.createEventTypeCta")}</Button>
            </div>

            {isEventTypesLoading ? (
              <InlineMessage message={t("admin.loadingMessage")} title={t("admin.loadingTitle")} />
            ) : null}

            {eventTypesError ? (
              <InlineMessage
                message={eventTypesError.message}
                title={t("admin.eventTypesErrorTitle")}
                tone="error"
              />
            ) : null}

            {eventTypes?.length ? (
              <div className="stack compact">
                {eventTypes.map((eventType) => (
                  <article className="booking-row admin-booking-row" data-testid="event-type-row" key={eventType.id}>
                    <div className="stack compact">
                      <strong>{eventType.title}</strong>
                      <p>{eventType.description}</p>
                    </div>
                    <div className="stack compact">
                      <strong>{t("admin.durationValue", { duration: eventType.durationMinutes })}</strong>
                      <div className="admin-inline-actions">
                        <Button onClick={() => openEditEventType(eventType)} variant="secondary">
                          {t("admin.editCta")}
                        </Button>
                        <Button onClick={() => openDeleteEventType(eventType)} variant="ghost">
                          {t("admin.deleteCta")}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <InlineMessage
                message={t("admin.noEventTypesMessage")}
                title={t("admin.noEventTypesTitle")}
              />
            )}
          </Card>

          <EventTypeDialog
            description={eventTypeForm.description}
            durationMinutes={eventTypeForm.durationMinutes}
            errors={eventTypeForm.errors}
            isSubmitting={eventTypeForm.isSubmitting}
            mode={eventTypeForm.mode}
            onDescriptionChange={(value) =>
              setEventTypeForm((current) => ({
                ...current,
                description: value,
                submitError: null,
              }))
            }
            onDurationChange={(value) =>
              setEventTypeForm((current) => ({
                ...current,
                durationMinutes: value,
                submitError: null,
              }))
            }
            onOpenChange={(open) => {
              if (!open) {
                closeEventTypeEditor();
              }
            }}
            onSubmit={handleSubmitEventType}
            onTitleChange={(value) =>
              setEventTypeForm((current) => ({
                ...current,
                title: value,
                submitError: null,
              }))
            }
            open={eventTypeForm.visible}
            submitError={eventTypeForm.submitError}
            title={eventTypeForm.title}
          />

          <EventTypeDeleteDialog
            isDeleting={isDeletingEventType}
            onConfirm={() => {
              void handleDeleteEventType();
            }}
            onOpenChange={(open) => {
              if (!open) {
                closeDeleteEventTypeDialog();
              }
            }}
            open={Boolean(eventTypeToDelete)}
            submitError={eventTypeDeleteError}
            title={eventTypeToDelete?.title ?? ""}
          />
        </div>
      )}
    </section>
  );
}

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
