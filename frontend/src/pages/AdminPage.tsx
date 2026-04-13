import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { InlineMessage } from "../components/common/InlineMessage";
import { SectionIntro } from "../components/common/SectionIntro";
import { api } from "../lib/api";
import { formatDateTime } from "../lib/datetime";
import { useAsyncData } from "../hooks/useAsyncData";

export function AdminPage() {
  const { i18n, t } = useTranslation();
  const {
    data: eventTypes,
    error: eventTypesError,
    isLoading: isEventTypesLoading,
    reload: reloadEventTypes,
  } = useAsyncData(() => api.listEventTypes(), []);
  const {
    data: bookings,
    error: bookingsError,
    isLoading: isBookingsLoading,
    reload: reloadBookings,
  } = useAsyncData(() => api.listFutureBookings(), []);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    durationMinutes: "30",
    isSubmitting: false,
    error: "",
    success: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormState((current) => ({
      ...current,
      isSubmitting: true,
      error: "",
      success: "",
    }));

    try {
      const created = await api.createEventType({
        title: formState.title,
        description: formState.description,
        durationMinutes: Number(formState.durationMinutes),
      });

      setFormState({
        title: "",
        description: "",
        durationMinutes: "30",
        isSubmitting: false,
        error: "",
        success: created.title,
      });
    } catch (error) {
      setFormState((current) => ({
        ...current,
        isSubmitting: false,
        error: error instanceof Error ? error.message : t("states.unknownError"),
        success: "",
      }));
    }
  }

  const eventTypeTitles = new Map(
    (eventTypes ?? []).map((eventType) => [eventType.id, eventType.title]),
  );

  return (
    <section className="stack">
      <SectionIntro eyebrow={t("admin.eyebrow")} title={t("admin.title")} />

      <div className="admin-layout">
        <Card as="form" className="stack" onSubmit={handleSubmit}>
          <h2>{t("admin.createTitle")}</h2>
          <label className="field">
            <span>{t("admin.titleLabel")}</span>
            <input
              onChange={(event) =>
                setFormState((current) => ({ ...current, title: event.target.value }))
              }
              required
              type="text"
              value={formState.title}
            />
          </label>
          <label className="field">
            <span>{t("admin.descriptionLabel")}</span>
            <textarea
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              value={formState.description}
            />
          </label>
          <label className="field">
            <span>{t("admin.durationLabel")}</span>
            <input
              min="1"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  durationMinutes: event.target.value,
                }))
              }
              required
              type="number"
              value={formState.durationMinutes}
            />
          </label>

          {formState.error ? (
            <InlineMessage message={formState.error} title={t("admin.createErrorTitle")} tone="error" />
          ) : null}

          {formState.success ? (
            <InlineMessage
              message={t("admin.createSuccessMessage", { title: formState.success })}
              title={t("admin.createSuccessTitle")}
              tone="success"
            />
          ) : null}

          <Button disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting ? t("admin.creating") : t("admin.createCta")}
          </Button>
        </Card>

        <Card as="section" className="stack">
          <div className="section-head">
            <h2>{t("admin.bookingsTitle")}</h2>
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

          {isBookingsLoading || isEventTypesLoading ? (
            <InlineMessage message={t("admin.loadingMessage")} title={t("admin.loadingTitle")} />
          ) : null}

          {bookingsError ? (
            <InlineMessage
              message={bookingsError.message}
              title={t("admin.bookingsErrorTitle")}
              tone="error"
            />
          ) : null}

          {eventTypesError ? (
            <InlineMessage
              message={t("admin.eventTypesErrorMessage", { message: eventTypesError.message })}
              title={t("admin.eventTypesErrorTitle")}
              tone="warning"
            />
          ) : null}

          {bookings ? (
            <div className="stack compact">
              {bookings.length ? (
                bookings.map((booking) => (
                  <article className="booking-row" key={booking.id}>
                    <div>
                      <strong>{booking.guestName}</strong>
                      <p>{booking.guestEmail}</p>
                    </div>
                    <div>
                      <strong>{formatDateTime(booking.startTime, i18n.language)}</strong>
                      <p>
                        {t("admin.eventTypeLabel")}:{" "}
                        {eventTypeTitles.get(booking.eventTypeId) ?? booking.eventTypeId}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <InlineMessage
                  message={t("admin.noBookingsMessage")}
                  title={t("admin.noBookingsTitle")}
                />
              )}
            </div>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
