import { FormEvent, useState } from "react";
import { api } from "../lib/api";
import { formatDateTime } from "../lib/datetime";
import { useAsyncData } from "../hooks/useAsyncData";
import { StatusBlock } from "../ui/StatusBlock";

export function AdminPage() {
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
        success: `${created.title} created successfully.`,
      });
    } catch (error) {
      setFormState((current) => ({
        ...current,
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Unknown error",
        success: "",
      }));
    }
  }

  const eventTypeTitles = new Map(
    (eventTypes ?? []).map((eventType) => [eventType.id, eventType.title]),
  );

  return (
    <section className="stack">
      <div className="page-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Manage event types and review future bookings.</h1>
        </div>
      </div>

      <div className="admin-layout">
        <form className="panel stack" onSubmit={handleSubmit}>
          <h2>Create event type</h2>
          <label className="field">
            <span>Title</span>
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
            <span>Description</span>
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
            <span>Duration (minutes)</span>
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
            <StatusBlock
              tone="error"
              title="Could not create event type"
              message={formState.error}
            />
          ) : null}

          {formState.success ? (
            <StatusBlock
              tone="success"
              title="Event type created"
              message={formState.success}
            />
          ) : null}

          <button className="button" disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting ? "Saving..." : "Create"}
          </button>
        </form>

        <section className="panel stack">
          <div className="section-head">
            <h2>Future bookings</h2>
            <button
              className="button secondary"
              onClick={() => {
                void reloadBookings();
                void reloadEventTypes();
              }}
              type="button"
            >
              Refresh
            </button>
          </div>

          {isBookingsLoading || isEventTypesLoading ? (
            <StatusBlock
              title="Loading bookings"
              message="Fetching future bookings and event type details from the owner API."
            />
          ) : null}

          {bookingsError ? (
            <StatusBlock
              tone="error"
              title="Failed to load bookings"
              message={bookingsError.message}
            />
          ) : null}

          {eventTypesError ? (
            <StatusBlock
              tone="warning"
              title="Could not resolve event type titles"
              message={`${eventTypesError.message} Falling back to raw event type IDs.`}
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
                      <strong>{formatDateTime(booking.startTime)}</strong>
                      <p>Event type: {eventTypeTitles.get(booking.eventTypeId) ?? booking.eventTypeId}</p>
                    </div>
                  </article>
                ))
              ) : (
                <StatusBlock
                  title="No future bookings"
                  message="The owner endpoint returned an empty list."
                />
              )}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
