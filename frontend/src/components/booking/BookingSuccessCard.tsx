import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { EventType } from "../../types/api";
import { bookingTestIds } from "../../features/booking/booking-selectors";
import { formatBookingDate, formatBookingTime } from "../../features/booking/booking-formatters";
import { Card } from "../common/Card";
import { Button } from "../common/Button";

type BookingSuccessCardProps = {
  eventType: EventType | null;
  startTime: string;
  date: string;
};

export function BookingSuccessCard({ eventType, startTime, date }: BookingSuccessCardProps) {
  const { i18n, t } = useTranslation();

  return (
    <Card className="success-card" data-testid={bookingTestIds.successCard} elevated>
      <div className="stack">
        <div className="stack compact">
          <p className="eyebrow">{t("booking.steps.success")}</p>
          <h2>{t("booking.successTitle")}</h2>
          <p>{t("booking.successMessage")}</p>
        </div>

        <dl className="summary-list">
          <div>
            <dt>{t("booking.summaryFormat")}</dt>
            <dd>{eventType?.title ?? t("booking.notSelected")}</dd>
          </div>
          <div>
            <dt>{t("booking.summaryDate")}</dt>
            <dd>{formatBookingDate(date, i18n.language)}</dd>
          </div>
          <div>
            <dt>{t("booking.summaryTime")}</dt>
            <dd>{formatBookingTime(startTime, i18n.language)}</dd>
          </div>
        </dl>

        <div className="button-row">
          <Link className="button button-secondary" to="/">
            {t("booking.successSecondary")}
          </Link>
          <Link className="button" to="/">
            {t("booking.successPrimary")}
          </Link>
        </div>
      </div>
    </Card>
  );
}
