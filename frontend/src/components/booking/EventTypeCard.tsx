import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { EventType } from "../../types/api";
import { Card } from "../common/Card";
import { bookingTestIds } from "../../features/booking/booking-selectors";

type EventTypeCardProps = {
  eventType: EventType;
};

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  const { t } = useTranslation();

  return (
    <Card as="article" className="event-card" elevated data-testid={bookingTestIds.eventCard}>
      <div className="stack compact">
        <p className="meta">{t("guest.eventMeta", { duration: eventType.durationMinutes })}</p>
        <h2>{eventType.title}</h2>
        <p>{eventType.description}</p>
      </div>
      <Link
        className="button"
        data-testid={bookingTestIds.eventCardCta}
        to={`/book/${eventType.id}`}
      >
        {t("guest.cta")}
      </Link>
    </Card>
  );
}
