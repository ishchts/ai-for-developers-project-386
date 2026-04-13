import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { bookingTestIds } from "../../features/booking/booking-selectors";
import { Button } from "../common/Button";
import { InlineMessage } from "../common/InlineMessage";

type BookingDetailsFormProps = {
  guestName: string;
  guestEmail: string;
  isSubmitting: boolean;
  error: string | null;
  conflict: string | null;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

export function BookingDetailsForm({
  guestName,
  guestEmail,
  isSubmitting,
  error,
  conflict,
  onNameChange,
  onEmailChange,
  onSubmit,
  onBack,
}: BookingDetailsFormProps) {
  const { t } = useTranslation();

  return (
    <form className="card stack" data-testid={bookingTestIds.bookingDetailsForm} onSubmit={onSubmit}>
      <div className="stack compact">
        <h2>{t("booking.detailsTitle")}</h2>
        <p>{t("booking.detailsSubtitle")}</p>
      </div>

      <label className="field">
        <span>{t("booking.nameLabel")}</span>
        <input
          data-testid={bookingTestIds.bookingNameInput}
          onChange={(event) => onNameChange(event.target.value)}
          required
          type="text"
          value={guestName}
        />
      </label>

      <label className="field">
        <span>{t("booking.emailLabel")}</span>
        <input
          data-testid={bookingTestIds.bookingEmailInput}
          onChange={(event) => onEmailChange(event.target.value)}
          required
          type="email"
          value={guestEmail}
        />
      </label>

      {isSubmitting ? (
        <InlineMessage
          message={t("booking.submittingMessage")}
          title={t("booking.submittingTitle")}
        />
      ) : null}

      {conflict ? (
        <InlineMessage message={conflict} title={t("booking.conflictTitle")} tone="warning" />
      ) : null}

      {error ? <InlineMessage message={error} title={t("booking.errorTitle")} tone="error" /> : null}

      <div className="button-row">
        <Button onClick={onBack} type="button" variant="ghost">
          {t("booking.backToTime")}
        </Button>
        <Button data-testid={bookingTestIds.confirmButton} disabled={isSubmitting} type="submit">
          {isSubmitting ? t("common.saving") : t("booking.confirmCta")}
        </Button>
      </div>
    </form>
  );
}
