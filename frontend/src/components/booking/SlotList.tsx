import { useTranslation } from "react-i18next";
import type { Slot } from "../../types/api";
import { bookingTestIds } from "../../features/booking/booking-selectors";
import { formatBookingTime } from "../../features/booking/booking-formatters";
import { Button } from "../common/Button";
import { EmptyState } from "./EmptyState";

type SlotListProps = {
  slots: Slot[];
  selectedStartTime: string;
  onSelect: (slot: Slot) => void;
};

export function SlotList({ slots, selectedStartTime, onSelect }: SlotListProps) {
  const { i18n, t } = useTranslation();
  const availableSlots = slots.filter((slot) => slot.available);

  if (!availableSlots.length) {
    return (
      <EmptyState
        message={t("booking.noSlotsMessage")}
        title={t("booking.noSlotsTitle")}
      />
    );
  }

  return (
    <div className="slot-list" data-testid={bookingTestIds.slotList}>
      {availableSlots.map((slot) => {
        const isSelected = selectedStartTime === slot.startTime;

        return (
          <Button
            aria-pressed={isSelected}
            className={isSelected ? "slot-button is-selected" : "slot-button"}
            data-testid={bookingTestIds.slotButton}
            key={slot.startTime}
            onClick={() => onSelect(slot)}
            variant={isSelected ? "primary" : "secondary"}
          >
            {formatBookingTime(slot.startTime, i18n.language)}
          </Button>
        );
      })}
    </div>
  );
}
