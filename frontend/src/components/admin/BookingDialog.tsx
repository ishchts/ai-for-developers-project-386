import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { InlineMessage } from "../common/InlineMessage";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import type { EventType } from "../../types/api";

type BookingDialogProps = {
  open: boolean;
  guestName: string;
  guestEmail: string;
  eventTypeId: string;
  startTime: string;
  eventTypes: EventType[];
  errors: Partial<Record<"guestName" | "guestEmail" | "eventTypeId" | "startTime", string>>;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestNameChange: (value: string) => void;
  onGuestEmailChange: (value: string) => void;
  onEventTypeChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function BookingDialog({
  open,
  guestName,
  guestEmail,
  eventTypeId,
  startTime,
  eventTypes,
  errors,
  isSubmitting,
  onOpenChange,
  onGuestNameChange,
  onGuestEmailChange,
  onEventTypeChange,
  onStartTimeChange,
  onSubmit,
}: BookingDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-w-[34rem] border border-border bg-popover text-popover-foreground shadow-[var(--shadow-md)]"
        data-testid="booking-dialog"
        showCloseButton={false}
      >
        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{t("admin.editBookingTitle")}</DialogTitle>
            <DialogDescription>{t("admin.editBookingDialogHint")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="booking-guest-name">{t("admin.guestNameLabel")}</Label>
            <Input
              aria-invalid={Boolean(errors.guestName)}
              id="booking-guest-name"
              onChange={(event) => onGuestNameChange(event.target.value)}
              type="text"
              value={guestName}
            />
            {errors.guestName ? <p className="field-error">{errors.guestName}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="booking-guest-email">{t("admin.guestEmailLabel")}</Label>
            <Input
              aria-invalid={Boolean(errors.guestEmail)}
              id="booking-guest-email"
              onChange={(event) => onGuestEmailChange(event.target.value)}
              type="email"
              value={guestEmail}
            />
            {errors.guestEmail ? <p className="field-error">{errors.guestEmail}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="booking-event-type">{t("admin.eventTypeLabel")}</Label>
            <select
              aria-invalid={Boolean(errors.eventTypeId)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              id="booking-event-type"
              onChange={(event) => onEventTypeChange(event.target.value)}
              value={eventTypeId}
            >
              <option value="">{t("admin.validation.eventTypeRequired")}</option>
              {eventTypes.map((eventType) => (
                <option key={eventType.id} value={eventType.id}>
                  {eventType.title}
                </option>
              ))}
            </select>
            {errors.eventTypeId ? <p className="field-error">{errors.eventTypeId}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="booking-start-time">{t("admin.startTimeLabel")}</Label>
            <Input
              aria-invalid={Boolean(errors.startTime)}
              id="booking-start-time"
              onChange={(event) => onStartTimeChange(event.target.value)}
              type="datetime-local"
              value={startTime}
            />
            {errors.startTime ? <p className="field-error">{errors.startTime}</p> : null}
          </div>

          <DialogFooter className="gap-3">
            <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
              {t("admin.cancelCta")}
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? t("common.saving") : t("admin.saveCta")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
