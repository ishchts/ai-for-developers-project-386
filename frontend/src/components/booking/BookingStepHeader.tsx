import { useTranslation } from "react-i18next";
import type { BookingStep } from "../../features/booking/booking-flow";
import { bookingSteps } from "../../features/booking/booking-flow";
import { bookingTestIds } from "../../features/booking/booking-selectors";

type BookingStepHeaderProps = {
  currentStep: BookingStep;
};

export function BookingStepHeader({ currentStep }: BookingStepHeaderProps) {
  const { t } = useTranslation();

  const steps = [
    { key: bookingSteps.selectSlot, label: t("booking.steps.chooseTime") },
    { key: bookingSteps.confirm, label: t("booking.steps.confirm") },
    { key: bookingSteps.success, label: t("booking.steps.success") },
  ];

  return (
    <div className="step-header" data-testid={bookingTestIds.bookingStepHeader}>
      {steps.map((step, index) => {
        const isActive = currentStep === step.key;
        const isComplete =
          ((currentStep === bookingSteps.confirm || currentStep === bookingSteps.success) &&
            step.key === bookingSteps.selectSlot) ||
          (currentStep === bookingSteps.success && step.key === bookingSteps.confirm);

        return (
          <div
            aria-current={isActive ? "step" : undefined}
            className={[
              "step-item",
              isActive ? "is-active" : "",
              isComplete ? "is-complete" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={step.key}
          >
            <span className="step-badge">{index + 1}</span>
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
