import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { formatDateTime, toDateInputValue } from "../lib/datetime";
import { useAsyncData } from "../hooks/useAsyncData";
import { StatusBlock } from "../ui/StatusBlock";
import { ApiError, type Booking } from "../types/api";

const today = toDateInputValue(new Date());

export function BookingPage() {
  const { eventTypeId } = useParams();
  const [date, setDate] = useState(today);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [submitState, setSubmitState] = useState<{
    isSubmitting: boolean;
    error: string | null;
    conflict: string | null;
    booking: Booking | null;
  }>({
    isSubmitting: false,
    error: null,
    conflict: null,
    booking: null,
  });

  const { data: eventTypes, error: eventTypesError } = useAsyncData(
    () => api.listEventTypes(),
    [],
  );

  const {
    data: slots,
    error: slotsError,
    isLoading: isSlotsLoading,
    reload: reloadSlots,
  } = useAsyncData(
    () => {
      if (!eventTypeId) {
        return Promise.resolve([]);
      }

      return api.listSlots(eventTypeId, date);
    },
    [eventTypeId, date],
  );

  const currentEventType =
    eventTypes?.find((eventType) => eventType.id === eventTypeId) ?? null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eventTypeId || !selectedStartTime) {
      setSubmitState((current) => ({
        ...current,
        error: "Choose a slot before submitting.",
      }));
      return;
    }

    setSubmitState({
      isSubmitting: true,
      error: null,
      conflict: null,
      booking: null,
    });

    try {
      const booking = await api.createBooking({
        eventTypeId,
        guestName,
        guestEmail,
        startTime: selectedStartTime,
      });

      setSubmitState({
        isSubmitting: false,
        error: null,
        conflict: null,
        booking,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSubmitState({
          isSubmitting: false,
          error: null,
          conflict: error.payload?.message ?? "This slot is already taken.",
          booking: null,
        });
        return;
      }

      setSubmitState({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Unknown error",
        conflict: null,
        booking: null,
      });
    }
  }

  return (
    <section className="stack">
      <div className="page-head">
        <div>
          <p className="eyebrow">Booking</p>
          <h1>{currentEventType?.title ?? "Select a slot"}</h1>
          <p className="hero-copy">
            {currentEventType?.description ??
              "The selected event type could not be resolved yet."}
          </p>
        </div>
        <Link className="button secondary" to="/">
          Back
        </Link>
      </div>

      {eventTypesError ? (
        <StatusBlock
          tone="error"
          title="Failed to load event type details"
          message={eventTypesError.message}
        />
      ) : null}

      <div className="booking-layout">
        <section className="panel stack">
          <label className="field">
            <span>Date</span>
            <input
              min={today}
              onChange={(event) => {
                setDate(event.target.value);
                setSelectedStartTime("");
                setSubmitState((current) => ({
                  ...current,
                  conflict: null,
                  error: null,
                  booking: null,
                }));
              }}
              type="date"
              value={date}
            />
          </label>

          {isSlotsLoading ? (
            <StatusBlock
              title="Loading slots"
              message="Fetching current slot availability."
            />
          ) : null}

          {slotsError ? (
            <div className="stack">
              <StatusBlock
                tone="error"
                title="Failed to load slots"
                message={slotsError.message}
              />
              <button
                className="button secondary"
                onClick={() => void reloadSlots()}
                type="button"
              >
                Retry
              </button>
            </div>
          ) : null}

          <div className="slot-list">
            {slots?.length ? (
              slots
                .filter((slot) => slot.available)
                .map((slot) => (
                  <button
                    className={
                      selectedStartTime === slot.startTime
                        ? "slot-button selected"
                        : "slot-button"
                    }
                    key={slot.startTime}
                    onClick={() => {
                      setSelectedStartTime(slot.startTime);
                      setSubmitState((current) => ({
                        ...current,
                        conflict: null,
                        error: null,
                        booking: null,
                      }));
                    }}
                    type="button"
                  >
                    {formatDateTime(slot.startTime)}
                  </button>
                ))
            ) : (
              <StatusBlock
                title="No slots found"
                message="The API did not return any available slot for this date."
              />
            )}
          </div>
        </section>

        <form className="panel stack" onSubmit={handleSubmit}>
          <h2>Guest details</h2>
          <label className="field">
            <span>Name</span>
            <input
              onChange={(event) => setGuestName(event.target.value)}
              required
              type="text"
              value={guestName}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              onChange={(event) => setGuestEmail(event.target.value)}
              required
              type="email"
              value={guestEmail}
            />
          </label>
          <div className="stack compact">
            <p className="meta">Selected slot</p>
            <strong>
              {selectedStartTime ? formatDateTime(selectedStartTime) : "Nothing selected"}
            </strong>
          </div>

          {submitState.isSubmitting ? (
            <StatusBlock
              title="Creating booking"
              message="Submitting the selected slot to the API."
            />
          ) : null}

          {submitState.conflict ? (
            <StatusBlock
              tone="warning"
              title="Slot conflict"
              message={submitState.conflict}
            />
          ) : null}

          {submitState.error ? (
            <StatusBlock
              tone="error"
              title="Booking failed"
              message={submitState.error}
            />
          ) : null}

          {submitState.booking ? (
            <StatusBlock
              tone="success"
              title="Booking created"
              message={`Confirmed for ${formatDateTime(submitState.booking.startTime)}.`}
            />
          ) : null}

          <button className="button" disabled={submitState.isSubmitting} type="submit">
            {submitState.isSubmitting ? "Saving..." : "Book now"}
          </button>
        </form>
      </div>
    </section>
  );
}
