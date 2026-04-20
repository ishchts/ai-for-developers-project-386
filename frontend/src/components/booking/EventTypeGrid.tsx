import * as Sentry from "@sentry/react";
import type { EventType } from "../../types/api";
import { EventTypeCard } from "./EventTypeCard";

type EventTypeGridProps = {
  eventTypes: EventType[];
};

// тестовое собыите для отправки ошибки в sentry
const defaultEventType: EventType = {
  id: "sentry-test",
  title: "Sentry meet",
  description: "Отправка события ошибки в sentry",
  durationMinutes: 50,
};

export function EventTypeGrid({ eventTypes }: EventTypeGridProps) {
  return (
    <div className="event-card-grid">
      {eventTypes.map((eventType) => (
        <EventTypeCard eventType={eventType} key={eventType.id} />
      ))}
      <EventTypeCard
        eventType={defaultEventType}
        link={
          <button
            className="bg-[#5b3a29] text-white p-2 rounded-[20px]"
            onClick={() => {
              Sentry.captureException(new Error("Manual Sentry test error"));
            }}
          >
            Send test error
          </button>
        }
      />
    </div>
  );
}
