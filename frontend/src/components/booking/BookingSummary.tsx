import { useTranslation } from "react-i18next";
import type { EventType } from "../../types/api";
import { bookingTestIds } from "../../features/booking/booking-selectors";
import { formatBookingDate, formatBookingTime } from "../../features/booking/booking-formatters";
import { Card } from "../common/Card";

type BookingSummaryProps = {
  eventType: EventType | null;
  date: string;
  selectedStartTime: string;
  className?: string;
};

export function BookingSummary({
  eventType,
  date,
  selectedStartTime,
  className = "",
}: BookingSummaryProps) {
  const { i18n, t } = useTranslation();

  return (
    <Card className={["booking-summary", className].filter(Boolean).join(" ")} data-testid={bookingTestIds.bookingSummary}>
      <div className="stack compact">
        <p className="eyebrow">{t("booking.summaryTitle")}</p>
        <h2>{eventType?.title ?? t("booking.eventTypeFallbackTitle")}</h2>
        <p>{eventType?.description ?? t("booking.summaryDescription")}</p>
      </div>
      <dl className="summary-list">
        <div>
          <dt>{t("booking.summaryDuration")}</dt>
          <dd>
            {eventType ? t("guest.eventMeta", { duration: eventType.durationMinutes }) : t("booking.notSelected")}
          </dd>
        </div>
        <div>
          <dt>{t("booking.summaryDate")}</dt>
          <dd>{date ? formatBookingDate(date, i18n.language) : t("booking.notSelected")}</dd>
        </div>
        <div>
          <dt>{t("booking.summaryTime")}</dt>
          <dd>
            {selectedStartTime
              ? formatBookingTime(selectedStartTime, i18n.language)
              : t("booking.notSelected")}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
