import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { BookingDetailsForm } from "../components/booking/BookingDetailsForm";
import { BookingStepHeader } from "../components/booking/BookingStepHeader";
import { BookingSuccessCard } from "../components/booking/BookingSuccessCard";
import { BookingSummary } from "../components/booking/BookingSummary";
import { DateSelector } from "../components/booking/DateSelector";
import { EmptyState } from "../components/booking/EmptyState";
import { SlotList } from "../components/booking/SlotList";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { InlineMessage } from "../components/common/InlineMessage";
import { SectionIntro } from "../components/common/SectionIntro";
import { bookingSteps, type BookingStep } from "../features/booking/booking-flow";
import { api } from "../lib/api";
import { toDateInputValue } from "../lib/datetime";
import { useAsyncData } from "../hooks/useAsyncData";
import { ApiError, type Booking, type Slot } from "../types/api";

const today = toDateInputValue(new Date());

export function BookingPage() {
  const { t } = useTranslation();
  const { eventTypeId } = useParams();
  const [date, setDate] = useState(today);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [step, setStep] = useState<BookingStep>(bookingSteps.selectSlot);
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
  const activeStep = submitState.booking ? bookingSteps.success : step;

  function resetTransientState() {
    setSubmitState((current) => ({
      ...current,
      conflict: null,
      error: null,
      booking: null,
    }));
  }

  function handleDateChange(value: string) {
    setDate(value);
    setSelectedStartTime("");
    setStep(bookingSteps.selectSlot);
    resetTransientState();
  }

  function handleSelectSlot(slot: Slot) {
    setSelectedStartTime(slot.startTime);
    setStep(bookingSteps.confirm);
    resetTransientState();
  }

  function handleBackToTime() {
    setStep(bookingSteps.selectSlot);
    setSubmitState((current) => ({
      ...current,
      error: null,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eventTypeId || !selectedStartTime) {
      setSubmitState((current) => ({
        ...current,
        error: t("booking.formRequiredMessage"),
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
          conflict: error.payload?.message ?? t("booking.conflictMessage"),
          booking: null,
        });
        setStep(bookingSteps.selectSlot);
        return;
      }

      setSubmitState({
        isSubmitting: false,
        error: error instanceof Error ? error.message : t("states.unknownError"),
        conflict: null,
        booking: null,
      });
    }
  }

  return (
    <section className="stack">
      <div className="page-head">
        <SectionIntro
          eyebrow={t("booking.pageEyebrow")}
          subtitle={currentEventType?.description ?? t("booking.summaryDescription")}
          title={currentEventType?.title ?? t("booking.eventTypeFallbackTitle")}
        />
        <Link className="button button-secondary" to="/">
          {t("booking.backToEvents")}
        </Link>
      </div>

      {eventTypesError ? (
        <InlineMessage
          message={eventTypesError.message}
          title={t("booking.eventTypeErrorTitle")}
          tone="error"
        />
      ) : null}

      <BookingStepHeader currentStep={activeStep} />

      {submitState.booking ? (
        <BookingSuccessCard
          date={date}
          eventType={currentEventType}
          startTime={submitState.booking.startTime}
        />
      ) : (
        <div className="booking-layout">
          <BookingSummary
            className="booking-sidebar"
            date={date}
            eventType={currentEventType}
            selectedStartTime={selectedStartTime}
          />

          <div className="booking-main">
            {activeStep === bookingSteps.selectSlot ? (
              <Card className="booking-panel">
                <div className="stack compact">
                  <h2>{t("booking.pickDateTitle")}</h2>
                  <p>{t("booking.pickDateSubtitle")}</p>
                </div>

                <DateSelector min={today} onChange={handleDateChange} value={date} />

                {isSlotsLoading ? (
                  <InlineMessage
                    message={t("booking.loadingSlotsMessage")}
                    title={t("booking.loadingSlotsTitle")}
                  />
                ) : null}

                {slotsError ? (
                  <div className="stack">
                    <InlineMessage
                      message={slotsError.message}
                      title={t("booking.slotsErrorTitle")}
                      tone="error"
                    />
                    <Button onClick={() => void reloadSlots()} variant="secondary">
                      {t("common.retry")}
                    </Button>
                  </div>
                ) : null}

                {submitState.conflict ? (
                  <InlineMessage
                    message={submitState.conflict}
                    title={t("booking.conflictTitle")}
                    tone="warning"
                  />
                ) : null}

                {slots ? (
                  <SlotList
                    onSelect={handleSelectSlot}
                    selectedStartTime={selectedStartTime}
                    slots={slots}
                  />
                ) : null}
              </Card>
            ) : null}

            {activeStep === bookingSteps.confirm ? (
              <BookingDetailsForm
                conflict={submitState.conflict}
                error={submitState.error}
                guestEmail={guestEmail}
                guestName={guestName}
                isSubmitting={submitState.isSubmitting}
                onBack={handleBackToTime}
                onEmailChange={setGuestEmail}
                onNameChange={setGuestName}
                onSubmit={handleSubmit}
              />
            ) : null}

            {!selectedStartTime && activeStep === bookingSteps.selectSlot && !isSlotsLoading && !slotsError ? (
              <EmptyState
                message={t("booking.emptySelectionHint")}
                title={t("booking.selectedSlot")}
              />
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
