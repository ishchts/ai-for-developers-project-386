import { useTranslation } from "react-i18next";
import { bookingTestIds } from "../../features/booking/booking-selectors";

type DateSelectorProps = {
  value: string;
  min: string;
  onChange: (value: string) => void;
};

export function DateSelector({ value, min, onChange }: DateSelectorProps) {
  const { t } = useTranslation();

  return (
    <label className="field">
      <span>{t("booking.dateLabel")}</span>
      <input
        data-testid={bookingTestIds.dateInput}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </label>
  );
}
