import type { EventType } from "../../types/api";
import { EventTypeCard } from "./EventTypeCard";

type EventTypeGridProps = {
  eventTypes: EventType[];
};

export function EventTypeGrid({ eventTypes }: EventTypeGridProps) {
  return (
    <div className="event-card-grid">
      {eventTypes.map((eventType) => (
        <EventTypeCard eventType={eventType} key={eventType.id} />
      ))}
    </div>
  );
}
